const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('marginaliaDesktop', Object.freeze({
  isDesktop: true,
  saveGeminiApiKey: (key) => ipcRenderer.invoke('marginalia:save-gemini-key', key),
}));
