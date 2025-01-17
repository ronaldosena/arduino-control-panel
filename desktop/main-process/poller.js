const ipc = require('electron').ipcMain
const BrowserWindow = require('electron').BrowserWindow
const SerialPort = require('serialport')

const CONNECTED = 1
const DISCONNECTED = 2

let status = DISCONNECTED
let listener = null
let usbPort = null

ipc.on('usb.status', function(event, fromWindowId) {
  pollPorts()
  listener = BrowserWindow.fromId(fromWindowId).webContents
  listener.send(status == CONNECTED ? 'usb.connected' : 'usb.disconnected', usbPort)
  setInterval(pollPorts, 1000)
})

function pollPorts() {
  SerialPort.list(function(err, ports) {
    if (ports !== null) {
      for (let i = 0; i < ports.length; i++) {
        const comName = ports[i].comName;
        if ((comName.toLowerCase().indexOf("dev") !== -1) || (comName.toLowerCase().indexOf("com") !== -1)) {
          if (status == DISCONNECTED) {
            status = CONNECTED
            usbPort = comName
            listener.send('usb.connected', comName)
          }
          return
        }
      }
      if (status == CONNECTED) {
        status = DISCONNECTED
        listener.send('usb.disconnected')
      }
    }
  })
}
