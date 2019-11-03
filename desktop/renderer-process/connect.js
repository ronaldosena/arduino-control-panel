const BrowserWindow = require('electron').remote.BrowserWindow
const ipc = require('electron').ipcRenderer

const WINDOW = BrowserWindow.getAllWindows()[0]
const availableBauds = [50, 75, 110, 134, 150, 200, 300, 600, 1200, 1800, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
const defaultBaudIndex = 16; // 9600
ipc.send('serial.status', WINDOW.id)

var connectedButton = document.getElementById('connect-button')
var connectedStatus = document.querySelector('.connected-status')
var connectedPort = null

connectedButton.addEventListener('mouseenter', function (event) {
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('scanning') && !connectedButton.classList.contains('not-found')) {
    connectedStatus.innerHTML = 'Connect'
  } else if (connectedButton.classList.length == 2) {
    connectedStatus.innerHTML = 'Disconnect'
  }
})

connectedButton.addEventListener('mouseleave', function (event) {
  connectedButton.classList.add('with-hover')
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('scanning') && !connectedButton.classList.contains('not-found')) {
    connectedStatus.innerHTML = 'Ready'
  } else if (connectedButton.classList.length == 2) {
    connectedStatus.innerHTML = 'Connected'
  }
})

connectedButton.addEventListener('click', function (event) {
  connectedButton.classList.remove('with-hover')
  if (connectedButton.classList.contains('disconnected') && !connectedButton.classList.contains('not-found') && !connectedButton.classList.contains('scanning')) {
    connect()
  } else if (connectedButton.classList.length == 1) {
    ipc.send('serial.close')
  }
})


ipc.on('usb.connect', function (event) {
  connect()
})

ipc.on('serial.open', function (event) {
  connectedButton.classList.remove('disconnected')
  connectedStatus.innerHTML = 'Connected'
})

ipc.on('serial.close', function (event) {
  connectedButton.classList.add("disconnected")
  var portElement = document.getElementById('port')
  if (portElement.options.length > 0) {
    connectedButton.classList.add('with-hover')
    connectedStatus.innerHTML = 'Ready'
  } else {
    connectedStatus.innerHTML = 'Not Found'
  }
})

ipc.on('serial.available', function (event, ports) {
  var portElement = document.getElementById('port')
  portElement.remove(0);
  ports.reverse();
  ports.forEach(port => {
    var option = document.createElement("option");
    option.text = port.name.toString();
    portElement.add(option);
  });

  let baudrateElement = document.getElementById('baudrate');
  baudrateElement.remove(0);
  availableBauds.forEach(baud => {
    var option = document.createElement("option");
    option.text = baud.toString();
    option.value = +baud;
    baudrateElement.add(option);
  });
  baudrateElement.selectedIndex = defaultBaudIndex;

  if (connectedButton.classList.contains('scanning') || connectedButton.classList.contains('not-found')) {
    connectedButton.classList.remove('scanning')
    connectedButton.classList.remove('not-found')
    connectedStatus.innerHTML = 'Ready'
  }
})


function connect() {
  // if (!connectedPort) return
  let portElement = document.getElementById('port')
  let port = portElement.options[portElement.selectedIndex].value;
  let baudrateElement = document.getElementById('baudrate')
  let baudrate = baudrateElement.options[baudrateElement.selectedIndex].value
  ipc.send('serial.connect', port, parseInt(baudrate))
}