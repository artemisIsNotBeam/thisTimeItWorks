const { app, BrowserWindow, ipcMain } = require('electron');
const { log } = require('node:console');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

var loggedIn = false;
var username = "";

ipcMain.on('getPokemon', async (event, mon) => {
  if (loggedIn){
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${mon.toLowerCase()}`);
      if (!response.ok) throw new Error(`Pokémon ${mon} not found`);

      const data = await response.json();
      event.reply('pokemonData', data);
    } catch (error) {
      event.reply('pokemonData', "error");
    }
  } else {
    event.reply('pokemonData', "not logged in");
  }
});

ipcMain.on('login', async (event, username, password) => {
  // Simulate a login process
  if (username === 'admin' && password === 'password') {
    loggedIn = true;
    username = username;
    event.reply('loginResponse', { success: true, message: 'Login successful!', username: username });
  } else {
    event.reply('loginResponse', { success: false, message: 'Invalid credentials' });
  }
});
  
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
