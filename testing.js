// this code is incredibly hacky. Run it and you'll see why...
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

sensorRange = {
    min: [],
    max: []
}

//1421 on right, 1411 on left for my laptop. I didn't feel like listing and using inquirer or something to select the correct port
var serialPort = new SerialPort("/dev/cu.usbmodem1411", {
    parser: serialport.parsers.readline("\n"),
    baudrate: 9600
});


serialPort.on('open', function () {

    serialPort.on('data', function(serialVars) {
        try {
            data = JSON.parse(serialVars);

            console.log(data);
        } catch (err) {
            //do nothing lol
        }

    });
});
