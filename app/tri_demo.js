const {
  app,
  BrowserWindow,
  dialog,
  Menu
} = require('electron')

const fs = require('fs')
const path = require('path')

const applicationMenu = require('./application-menu')

let mainWindow = null

let currentLat = 0.0
let currentLng = 0.0
let lastReqTimestamp = 0.00

let videoFile = null
let OBD_data = null

const createWindow = () => {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  mainWindow.loadURL('file://' + __dirname + '/index.html')

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('init')
  })

  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  Menu.setApplicationMenu(applicationMenu)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('active', () => {
  if (mainWindow == null) {
    Menu.setApplicationMenu(applicationMenu)
    createWindow()
  }
})

const openVideoFromUser = exports.openVideoFromUser = () => {
  console.log("user request to open video")

  const videoFiles = dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'MPEG 4', extensions: ['mp4'] },
      { name: 'AVI', extensions: ['avi'] }
    ]
  })
  
  if (!videoFiles) { return }
  
  videoFile = videoFiles[0]

  console.log("Server: user selected the video: " + path.win32.basename(videoFile))

  const OBD_file = path.win32.dirname(videoFile) + '/../data/OBD.json'
  if (!OBD_file) { return }

  OBD_data = JSON.parse(fs.readFileSync(OBD_file, 'utf8'))

  currentLat = OBD_data[0].lati
  currentLng = OBD_data[0].long

  console.log("Start GPS position:\t latittude: " + currentLat + "longitude: " + currentLng)

  mainWindow.webContents.send('update-gps', currentLat, currentLng)

  mainWindow.webContents.send('opened-video', videoFile)
}

const getCurrentGPS = exports.getCurrentGPS = (reqTimeStamp) => {
  // if the time difference is greater than 1s
  if (Math.abs(Math.floor(reqTimeStamp) - Math.floor(lastReqTimestamp)) >= 1) {
    let data_index = Math.floor(reqTimeStamp)

    currentLat = OBD_data[data_index].lati
    currentLng = OBD_data[data_index].long
    
    mainWindow.webContents.send('update-gps', currentLat, currentLng)
  }

  lastReqTimestamp = reqTimeStamp

  console.log("Server: requset time: " + reqTimeStamp +
    "current GPS: latitude " + currentLat + "\t longitude: " +
      currentLng)

  mainWindow.webContents.send('update-gps', currentLat, currentLng)
}


// mainWindow.webContents.send('update-link')