// this code is incredibly hacky. Run it and you'll see why...
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;

var vibrationState = false;
var serialVars;

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
    console.log('CALIBRATING, PLEASE MOVE HAND AS FAR BACKWARDS AND FORWARDS AS POSSIBLE');

    var startTime = Date.now();
    var angle1;
    var angle2;

    serialPort.on('data', function(serialVars) {
        try {
            data = JSON.parse(serialVars);

            if (data[2]) {
                vibrationOn();
                //going to need to subtract 18 while vibrationState
            } else {
                vibrationOff();
            }

            if (Date.now() <= startTime + 5000) {
                if (data[0] < sensorRange.min[0] || !sensorRange.min[0]) {
                    sensorRange.min[0] = data[0];
                }
                if (data[1] < sensorRange.min[1] || !sensorRange.min[1]) {
                    sensorRange.min[1] = data[1];
                }
                if (data[0] > sensorRange.max[0] || !sensorRange.max[0]) {
                    sensorRange.max[0] = data[0];
                }
                if (data[1] > sensorRange.max[1] || !sensorRange.max[1]) {
                    sensorRange.max[1] = data[1];
                }
            } else {
                angle1 = mapValues(data[0], sensorRange.min[0], sensorRange.max[0], 0, 90);
                angle2 = mapValues(data[1], sensorRange.min[1], sensorRange.max[1], 0, 90);

                console.log(angle1, angle2);
            }

        } catch (err){
            //console.log('ERROR: ' + err);
        }

    });
});

function mapValues(value, min, max, newMin, newMax) {
    var newValue =  (value - min) * (newMax - newMin) / (max - min) + newMin;

    if (newValue < newMin) {
        newValue = newMin;
    } else if (newValue > newMax) {
        newValue = newMax;
    }

    return newValue;
}

function vibrationOn() {
    if (!vibrationState) {
        vibrationState = true;
        serialPort.write('Y', function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    }
}

function vibrationOff() {
    if (vibrationState) {
        vibrationState = false;
        serialPort.write('N', function(err, results) {
            console.log('err ' + err);
            console.log('results ' + results);
        });
    }
}
