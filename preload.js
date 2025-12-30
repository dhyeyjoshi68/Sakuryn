const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('sakurynAPI', {
    chooseFolder: () => ipcRenderer.invoke("choose-music-folder"),
    readFolder: (folderPath) => ipcRenderer.invoke("read-folder", folderPath)
});
