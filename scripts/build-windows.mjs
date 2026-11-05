import { spawnSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktop = path.join(root, 'desktop');
const runtimeRoot = path.join(desktop, 'build-runtime');
const envPath = path.join(root, '.env');

function fail(message) {
  console.error(`Windows package: ${message}`);
  process.exit(1);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(`${command} exited with code ${result.status ?? 'unknown'}.`);
}

async function isDirectory(target) {
  try { return (await stat(target)).isDirectory(); } catch { return false; }
}

if (!(await stat(envPath).catch(() => null))) {
  fail('The existing .env file is missing; no environment values were invented.');
}
const env = dotenv.parse(await readFile(envPath));
if (env.VITE_FIREBASE_PROJECT_ID !== 'marginalia-test-emulator' || !['true', '1'].includes(env.VITE_USE_FIREBASE_EMULATORS || '')) {
  fail('Refusing to package: .env must select marginalia-test-emulator with VITE_USE_FIREBASE_EMULATORS=true.');
}

let jdkHome = process.env.MARGINALIA_JDK_HOME || process.env.JAVA_HOME || '';
const localRecoveryJdk = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'MarginaliaRecovery', 'Temurin-21', 'jdk-21.0.13+9');
if (!jdkHome && await isDirectory(localRecoveryJdk)) jdkHome = localRecoveryJdk;
const jlink = path.join(jdkHome, 'bin', process.platform === 'win32' ? 'jlink.exe' : 'jlink');
const java = path.join(jdkHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
if (!jdkHome || !(await stat(jlink).catch(() => null))) {
  fail('JDK 21+ with jlink is required. Set MARGINALIA_JDK_HOME to its directory.');
}
const version = spawnSync(java, ['-version'], { encoding: 'utf8' });
const versionText = `${version.stdout || ''}\n${version.stderr || ''}`;
if (!/version "21(?:\.|"|\+)/.test(versionText)) fail('The selected Java runtime must be version 21.');

const bundledJava = path.join(runtimeRoot, 'java-compact');
if (!(await isDirectory(bundledJava))) {
  await mkdir(runtimeRoot, { recursive: true });
  run(jlink, [
    '--add-modules', 'java.base,java.compiler,java.desktop,java.naming,java.sql,jdk.httpserver,jdk.management,jdk.unsupported,jdk.crypto.ec',
    '--strip-debug', '--no-header-files', '--no-man-pages', '--compress=2',
    '--output', bundledJava,
  ], root);
}
if (!(await stat(path.join(bundledJava, 'bin', 'java.exe')).catch(() => null))) {
  fail('The bundled Java runtime is incomplete. Remove desktop/build-runtime/java-compact and retry.');
}

const sourceCache = path.join(process.env.USERPROFILE || process.env.HOME || '', '.cache', 'firebase', 'emulators');
const targetCache = path.join(runtimeRoot, 'firebase-emulators');
await mkdir(targetCache, { recursive: true });
const cachedJars = (await readdir(sourceCache).catch(() => []))
  .filter((name) => name.endsWith('.jar'));
if (!cachedJars.some((name) => name.startsWith('cloud-firestore-emulator-')) ||
    !cachedJars.some((name) => name.startsWith('cloud-storage-rules-runtime-'))) {
  fail('The Firebase Firestore/Storage emulator downloads are not cached. Start the local emulators once, then rebuild.');
}
for (const name of cachedJars) {
  await cp(path.join(sourceCache, name), path.join(targetCache, name), { force: true });
}

console.log('Building the production renderer with the existing emulator-only .env configuration.');
run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], root);

console.log('Building the Windows x64 installer.');
run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron-builder', '--win', 'nsis', '--x64', '--publish', 'never'], desktop);

console.log(`Windows installer output: ${path.join(root, 'artifacts', 'windows')}`);
