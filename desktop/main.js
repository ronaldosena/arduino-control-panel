// // Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const glob = require("glob");

// const debug = /--debug/.test(process.argv[2])

process.on('unhandledRejection', r => console.log(r));

var mainWindow = null
global.dataset = {values: null};

function initialize() {
  // var shouldQuit = makeSingleInstance()
  // if (shouldQuit) return app.quit()

  loadDemos()

  function createMainWindow() {
    var windowOptions = {
      width: 400,
      height: 600,
      // frame: false,
      // resizable: false,
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#E1F3F4',
      title: "Control Panel",
      icon: path.join(__dirname, '/assets/app-icon/png/512.png'),
      webPreferences: {
        // preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
      }
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
    mainWindow.setMenuBarVisibility(false)
    mainWindow.webContents.openDevTools()
    
    // if (debug) {
    //   mainWindow.webContents.openDevTools()
    //   require('devtron').install()
    // }

    mainWindow.on('closed', function () {
      mainWindow = null
    })
  }

  app.on('ready', function () {
    createMainWindow()
  })

  app.on('activate', function () {
    if (mainWindow === null) {
      createMainWindow()
    }
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance() {
  return app.makeSingleInstance(function () {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos() {
  var files = glob.sync(path.join(__dirname, 'main-process/*.js'))
  files.forEach(function (file) {
    require(file)
  })
}

initialize()
