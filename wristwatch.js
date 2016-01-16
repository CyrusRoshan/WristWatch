var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var serialPort = new SerialPort("/dev/cu.usbmodem1421", {
    parser: serialport.parsers.readline("\n"),
    baudrate: 9600
});


serialPort.on("open", function () {
    console.log('open');

    serialPort.on('data', function(data) {
        console.log('data received: ' + JSON.parse(data));
        //so hacky... run it like 5x and you'll usually recieve the data at the beginning (staring with "[") for proper parsing
    });
});
