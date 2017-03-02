const {
    ipcRenderer,
    remote
} = require('electron')

mainProcess = remote.require('./tri_demo')
const TriMap = require('./src/triMap.js')

const mapDisplay = document.querySelector('#map')
const videoPlayer = document.querySelector('#video-player')


let triMapper = null

// update the link section highlight
const updateLinkPlot = (map, shape_points) => {
    let directionsDisplay = new google.maps.DirectionsRender
    let directionsService = new google.maps.DirectionsService

    directionDisplay.setMap(map)
}

// Listen to the init signal
ipcRenderer.on('init', (event) => {

    let isl_lati = 42.31995
    let isl_longi = -83.233371

    triMapper = new TriMap(isl_lati, isl_longi, mapDisplay)
})

// Listen to the update-gps signal
ipcRenderer.on('update-gps', (event, currentLat, currentLng) => {
    console.log("event: update-gps")
    triMapper.updateGPSplot(currentLat, currentLng)
})

// Listen to the update-link signal
ipcRenderer.on('update-link', (event, shape_points) => {
    console.log("event: update-link")
    updateLinkPlot(map, shap_points)
})

ipcRenderer.on('opened-video', (event, videoFile) => {
    console.log("event: opened-video")
    videoPlayer.src = videoFile 
    videoPlayer.play()
})

videoPlayer.addEventListener('timeupdate', () => {
    console.log("event: video-player -> ontimeupdate\n" + "currentTime: " + videoPlayer.currentTime)

    mainProcess.getCurrentGPS(videoPlayer.currentTime)
})
