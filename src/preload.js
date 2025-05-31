// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  loadRequests: () => ipcRenderer.send("loadRequests"),
  onRequestsLoaded: (callback) => ipcRenderer.on("requestsLoaded", (event, data) => callback(data)),
  getConfig: () => { ipcRenderer.send("getConfig") },
  onConfigLoaded: (callback) => ipcRenderer.on("configLoaded", (event, data) => callback(data)),
})