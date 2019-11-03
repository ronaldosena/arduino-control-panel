const ipc = require('electron').ipcRenderer
require('moment')
require('chart.js')
require('chartjs-plugin-streaming')

let data2plot = [];
let plotCounter = 0;

ipc.on('serial.dataReceived', function (event, val) {
  // assuming an acquire frequency of 1kHz, there will be 1000 points to plot in just 1 second however,
  //we don't need to plot all of them, the human eye can't distinguish more than a few dots.
  //That means that we can just choose, let's say 50 of those points.
  if (plotCounter % 50 == 0) {
    data2plot.push(val);
    plotCounter = 0;
  }
  plotCounter++;
})

function onRefresh(chart) {
  chart.config.data.datasets.forEach(function (dataset) {
    data2plot.forEach(data => {
      dataset.data.push({
        x: Date.now(),
        y: data
      });
    });
    data2plot = []
  });
}

var config = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Dataset 1 (linear interpolation)',
      backgroundColor: 'rgb(54, 162, 235, 0.5)', //).alpha(0.5).rgbString(),
      borderColor: 'rgb(54, 162, 235, 0.5)',
      fill: false,
      lineTension: 0,
      data: []
    }]
  },
  options: {
    title: {
      display: true,
      text: 'Line chart (hotizontal scroll) sample'
    },
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 50,
          delay: 0,
          onRefresh: onRefresh
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'value'
        }
      }]
    }
  }
};

window.onload = function () {
  var ctx = document.getElementById('myChart').getContext('2d');
  window.myChart = new Chart(ctx, config);
};