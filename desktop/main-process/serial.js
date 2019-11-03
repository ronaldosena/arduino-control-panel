const ipc = require('electron').ipcMain
const BrowserWindow = require('electron').BrowserWindow
const SerialPort = require('serialport')
// const Readline = SerialPort.parsers.Readline
const Readline = require('@serialport/parser-readline')
const remote = require('electron').remote;
const ByteLength = require('@serialport/parser-byte-length')

let serialport = null
let listener = null

ipc.on('serial.status', function (event, fromWindowId) {
  listener = BrowserWindow.fromId(fromWindowId).webContents
  listPorts()
})

ipc.on('serial.close', function (event) {
  serialport.close((e) => { })
})

ipc.on('serial.write', function (event, data) {
  if (serialport) {
    serialport.write(data)
  }
})

ipc.on('serial.connect', function (event, port, baudRate) {
  serialport = new SerialPort(port, { baudRate, lock: false })

  const parser = serialport.pipe(new ByteLength({length: 4}))
  parser.on('data', function (data) {
    var val = data[1] << 8 | data[2];
    listener.send('serial.dataReceived', val)
  })

  serialport.on('open', function () {
    listener.send('serial.open')
  })

  serialport.on('close', function () {
    listener.send('serial.close')
    serialport = null
  })

  serialport.on('error', function (err) {
    console.error(err)
  })
})

function listPorts() {
  SerialPort.list(function (err, ports) {
    if (ports !== null) {
      let portNames = [];
      for (let i = 0; i < ports.length; i++) {
        if (ports[i].comName.toLowerCase().indexOf("com") !== -1) {
          portNames.push({ name: ports[i].comName, manufacturer: ports[i].manufacturer });
        }
        // handling the empty port for unix os
        if (ports[i].comName.toLowerCase().indexOf("dev") !== -1 && ports[i].pnpId !== undefined) {
          portNames.push({ name: ports[i].comName, manufacturer: ports[i].manufacturer });
        }
      }
      if (portNames.length > 0) {
        listener.send('serial.available', portNames)
      } else {
        listener.send('serial.unavailable')
      }
      return;
    }
  })
}