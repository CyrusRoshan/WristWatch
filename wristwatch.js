// this code is incredibly hacky. Run it and you'll see why...
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var vibrationState = false;
var serialVars;

var serialPort = new SerialPort("/dev/cu.usbmodem1421", {
    parser: serialport.parsers.readline("\n"),
    baudrate: 9600
});


serialPort.on('open', function () {
    console.log('open');

    serialPort.on('data', function(data) {
        serialVars = JSON.parse(data);
        console.log('data received: ' + serialVars);

        if (serialVars[2]) {
            vibrationOn();
            //going to need to subtract 18 while vibrationState
        } else {
            vibrationOff();
        }
    });
});

function vibrationOn(){
    if (!vibrationState) {
        vibrationState = true;
        serialPort.write('Y', function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    }
}

function vibrationOff(){
    if (vibrationState) {
        vibrationState = false;
        serialPort.write('N', function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    }
}
