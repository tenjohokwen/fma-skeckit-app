const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to renderer process via context bridge
contextBridge.exposeInMainWorld('electron', {
  // Platform information
  platform: process.platform,

  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },

  // Deep linking callback registration
  onDeepLink: (callback) => {
    ipcRenderer.on('deeplink', (event, url) => callback(url));
  },

  // Remove deep link listener
  removeDeepLinkListener: () => {
    ipcRenderer.removeAllListeners('deeplink');
  }
});
