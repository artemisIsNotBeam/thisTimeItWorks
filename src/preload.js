// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getPokemon : (mon) => ipcRenderer.send("getPokemon", mon),
  onPokemonData: (callback) => ipcRenderer.on("pokemonData", (event, data) => callback(data)),
  logIn: (username, password) => ipcRenderer.send("login", username, password),
  logInResponse: (callback) => ipcRenderer.on("loginResponse", (event, data) => callback(data))
})