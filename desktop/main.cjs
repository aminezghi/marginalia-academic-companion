const { app, BrowserWindow, dialog, ipcMain, safeStorage, shell } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const net = require('node:net');
const path = require('node:path');
const { createBackend } = require('./backend.cjs');

const TEST_PROJECT_ID = 'marginalia-test-emulator';
const APP_PORT = 41737;
const EMULATOR_PORTS = [9099, 8080, 9199];
const API_KEY_FILENAME = 'gemini-api-key.dpapi';

app.setAppUserModelId('org.marginalia.academiccompanion');

const packaged = app.isPackaged;
const resourcePath = packaged ? process.resourcesPath : path.resolve(__dirname, '..');
const firebaseDir = packaged ? path.join(resourcePath, 'firebase') : resourcePath;
const emulatorCache = packaged
  ? path.join(resourcePath, 'firebase-emulators')
  : path.join(app.getPath('home'), '.cache', 'firebase', 'emulators');
const javaHome = packaged ? path.join(resourcePath, 'runtime', 'java') : process.env.JAVA_HOME;
const distPath = packaged ? path.join(resourcePath, 'dist') : path.join(resourcePath, 'dist');
const dataDir = path.join(app.getPath('userData'), 'firebase-data');
const apiKeyFile = path.join(app.getPath('userData'), API_KEY_FILENAME);

let emulatorProcess;
let localHttpServer;
let mainWindow;
let quitStarted = false;
let quitAllowed = false;
let periodicExport;
let exportInProgress = Promise.resolve();
const backend = createBackend({ distPath });

function canConnect(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(500);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
  });
}

async function assertPortsAvailable() {
  for (const port of [APP_PORT, ...EMULATOR_PORTS]) {
    if (await canConnect(port)) {
      throw new Error(`Port ${port} is already in use. Close the other app using it, then start Marginalia again.`);
    }
  }
}

async function waitForEmulators() {
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    if (!emulatorProcess || emulatorProcess.exitCode !== null) {
      throw new Error('The local Firebase emulators stopped during startup. Check the app log for details.');
    }
    const states = await Promise.all(EMULATOR_PORTS.map(canConnect));
    if (states.every(Boolean)) {
      await new Promise((resolve) => setTimeout(resolve, 1600));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error('The local Firebase emulators did not become ready within two minutes.');
}

function startEmulators() {
  const cliEntrypoint = require.resolve('firebase-tools/lib/bin/firebase.js');
  const configPath = path.join(firebaseDir, 'firebase.json');
  const args = [
    cliEntrypoint,
    'emulators:start',
    '--project', TEST_PROJECT_ID,
    '--only', 'auth,firestore,storage',
    '--config', configPath,
    '--export-on-exit', dataDir,
  ];
  if (require('node:fs').existsSync(path.join(dataDir, 'firebase-export-metadata.json'))) {
    args.push('--import', dataDir);
  }
  try {
    require('node:fs').accessSync(configPath);
    require('node:fs').accessSync(javaHome);
  } catch {
    throw new Error('Marginalia is missing its bundled Firebase configuration or Java runtime. Reinstall the app.');
  }

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    FIREBASE_EMULATORS_PATH: emulatorCache,
    JAVA_HOME: javaHome,
    PATH: `${path.join(javaHome, 'bin')};${process.env.PATH || ''}`,
    CI: '1',
  };
  emulatorProcess = spawn(process.execPath, args, {
    cwd: firebaseDir,
    env,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  emulatorProcess.stdout.on('data', (chunk) => console.log(`[Firebase] ${chunk.toString().trimEnd()}`));
  emulatorProcess.stderr.on('data', (chunk) => console.error(`[Firebase] ${chunk.toString().trimEnd()}`));
  emulatorProcess.on('error', (error) => console.error('Could not start Firebase emulators:', error.message));
  emulatorProcess.on('exit', (code) => {
    if (!quitStarted && code !== 0) {
      console.error(`Firebase emulator process exited with code ${code}.`);
      if (mainWindow && !mainWindow.isDestroyed()) {
        dialog.showErrorBox('Marginalia local database stopped', 'The local Firebase emulators stopped unexpectedly. Restart Marginalia to continue.');
      }
    }
  });
}

async function exportEmulatorData() {
  if (!emulatorProcess || emulatorProcess.exitCode !== null) return;
  if (exportInProgress) await exportInProgress;
  const cliEntrypoint = require.resolve('firebase-tools/lib/bin/firebase.js');
  const args = [
    cliEntrypoint,
    'emulators:export',
    dataDir,
    '--project', TEST_PROJECT_ID,
    '--config', path.join(firebaseDir, 'firebase.json'),
  ];
  exportInProgress = new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: firebaseDir,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', FIREBASE_EMULATORS_PATH: emulatorCache, JAVA_HOME: javaHome },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timeout = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', (chunk) => console.log(`[Firebase export] ${chunk.toString().trimEnd()}`));
    child.stderr.on('data', (chunk) => console.error(`[Firebase export] ${chunk.toString().trimEnd()}`));
    child.once('error', (error) => { console.error('Could not export local data:', error.message); clearTimeout(timeout); resolve(); });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      if (code !== 0) console.error(`Local data export exited with code ${code}.`);
      resolve();
    });
  });
  await exportInProgress;
}

async function stopEmulators() {
  const child = emulatorProcess;
  if (!child) return;

  if (child.exitCode === null && child.signalCode === null) {
    if (process.platform === 'win32' && child.pid) {
      await new Promise((resolve) => {
        const killer = spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
          windowsHide: true,
          stdio: 'ignore',
        });
        killer.once('error', resolve);
        killer.once('exit', resolve);
      });
    } else {
      child.kill('SIGTERM');
    }

    await new Promise((resolve) => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      const timeout = setTimeout(resolve, 10000);
      child.once('exit', () => { clearTimeout(timeout); resolve(); });
    });
  }

  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const portsStillOpen = await Promise.all(EMULATOR_PORTS.map(canConnect));
    if (portsStillOpen.every((isOpen) => !isOpen)) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  console.error('One or more Firebase emulator ports did not release before shutdown completed.');
}

function closeLocalServer() {
  if (!localHttpServer || !localHttpServer.listening) return Promise.resolve();
  return new Promise((resolve) => localHttpServer.close((error) => {
    if (error) console.error('Could not close the local app server cleanly:', error.message);
    resolve();
  }));
}

async function loadSavedApiKey() {
  try {
    if (!safeStorage.isAsyncEncryptionAvailable()) return;
    const ciphertext = await fs.readFile(apiKeyFile);
    const { result } = await safeStorage.decryptStringAsync(ciphertext);
    if (result) backend.setGeminiApiKey(result);
  } catch (error) {
    if (error && error.code !== 'ENOENT') console.error('Saved Gemini key could not be read; AI remains locked.');
  }
}

function registerSecureKeyIpc() {
  ipcMain.handle('marginalia:save-gemini-key', async (event, candidate) => {
    if (!mainWindow || event.sender.id !== mainWindow.webContents.id ||
        event.senderFrame !== event.sender.mainFrame ||
        !event.senderFrame.url.startsWith(`http://127.0.0.1:${APP_PORT}/`)) {
      throw new Error('Invalid app window.');
    }
    if (typeof candidate !== 'string' || candidate.trim().length < 8 || candidate.length > 512) {
      throw new Error('Enter a valid Gemini API key.');
    }
    if (!safeStorage.isAsyncEncryptionAvailable()) {
      throw new Error('Windows secure storage is unavailable. AI cannot be enabled safely on this device.');
    }
    const encrypted = await safeStorage.encryptStringAsync(candidate.trim());
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    const tempFile = `${apiKeyFile}.tmp`;
    await fs.writeFile(tempFile, encrypted);
    await fs.rename(tempFile, apiKeyFile);
    backend.setGeminiApiKey(candidate.trim());
    return { configured: true };
  });
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#EDEBE6',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    try {
      const authPopup = new URL(target);
      if (authPopup.origin === 'http://127.0.0.1:9099' && authPopup.pathname === '/__/auth/handler') {
        return { action: 'allow' };
      }
    } catch {}
    if (target.startsWith('https://')) shell.openExternal(target);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, target) => {
    if (target !== url) event.preventDefault();
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.loadURL(url);
}

async function startApp() {
  await assertPortsAvailable();
  await fs.mkdir(dataDir, { recursive: true });
  await loadSavedApiKey();
  registerSecureKeyIpc();
  startEmulators();
  await waitForEmulators();

  localHttpServer = backend.app.listen(APP_PORT, '127.0.0.1', () => {
    const url = `http://127.0.0.1:${APP_PORT}`;
    createWindow(url);
    periodicExport = setInterval(() => {
      if (!quitStarted) exportEmulatorData();
    }, 5 * 60 * 1000);
  });
  localHttpServer.once('error', (error) => {
    console.error('Could not start local app server:', error.message);
    dialog.showErrorBox('Marginalia could not start', `Local server error: ${error.message}`);
    app.quit();
  });
}

app.whenReady().then(() => startApp()).catch((error) => {
  console.error('Marginalia startup failed:', error);
  dialog.showErrorBox('Marginalia could not start', error instanceof Error ? error.message : 'Unknown startup error.');
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0 && localHttpServer) {
    createWindow(`http://127.0.0.1:${APP_PORT}`);
  }
});

app.on('before-quit', (event) => {
  if (quitAllowed) return;
  event.preventDefault();
  if (quitStarted) return;
  quitStarted = true;
  clearInterval(periodicExport);
  void (async () => {
    await exportEmulatorData();
    await closeLocalServer();
    await stopEmulators();
    quitAllowed = true;
    app.quit();
  })().catch((error) => {
    console.error('Marginalia shutdown cleanup failed:', error);
    // A cleanup failure must not leave a hidden app process running forever.
    void stopEmulators().finally(async () => {
      await closeLocalServer();
      quitAllowed = true;
      app.quit();
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
