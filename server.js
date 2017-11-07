var express = require('express');
var five = require("johnny-five");

var app = require('express')();
var board = new five.Board();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var datetime = require('node-datetime');

app.use('/static', express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(7000, function(){
  console.log('open browser in localhost:7000');
});

let currentTemperature = 
{
	date:null,
	time:null,
	degrees:null
}

let temperatures = [];

board.on("ready", function() {

  var thermometer = new five.Thermometer({
    controller: "DS18B20",
    pin: 2
  });

  thermometer.on("change", function() {
		currentTemperature.degrees = this.celsius;
		getDateTime();
		temperatures.unshift(Object.assign({}, currentTemperature));
	});
	
	io.on('connection', function (socket) {
		socket.emit('temperature', currentTemperature);
		socket.emit('temperatures', temperatures);
	});

	getTemperature();
});


function getDateTime()
{
	var dt = datetime.create();
	var time = dt.format('H:M:S');
	currentTemperature.time = time;
	var date = dt.format('m/d/Y');
	currentTemperature.date = date;
}


function getTemperature()
{
	setInterval(function(){
		io.emit('temperature', currentTemperature);
		io.emit('temperatures', temperatures);
	}, 10000)
}