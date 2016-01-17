// this code is incredibly hacky. Look at it thoroughly and you'll see why...
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var robot = require("robotjs");
var MA = require('moving-average');

var preAvgTimeInterval = 2.5 * 1000;
var timeInterval = 10 * 1000;
var flappyTimeInterval = 1 * 1000;

var preAvg = {sensor1: MA(preAvgTimeInterval), sensor2: MA(preAvgTimeInterval)};
var avg = {sensor1: MA(timeInterval), sensor2: MA(timeInterval)};
var flappyAvg = {sensor1: MA(flappyTimeInterval), sensor2: MA(flappyTimeInterval)};

var vibrationState = false;
var flappyState = false;

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
    var flappyPlay = false;
    var startFlapTime;

    vibrationOff();

    serialPort.on('data', function(serialVars) {
        try {
            data = JSON.parse(serialVars);
            flappyPlay = data[2]; // at this point I'm intentionally writing hacky code

            if (Date.now() <= startTime + 5000) {
                preAvg.sensor1.push(Date.now(), data[0]);
                preAvg.sensor2.push(Date.now(), data[1]);

                if (preAvg.sensor1.movingAverage() < sensorRange.min[0] || !sensorRange.min[0]) {
                    sensorRange.min[0] = preAvg.sensor1.movingAverage();
                }
                if (preAvg.sensor2.movingAverage() < sensorRange.min[1] || !sensorRange.min[1]) {
                    sensorRange.min[1] = preAvg.sensor2.movingAverage();
                }
                if (preAvg.sensor1.movingAverage() > sensorRange.max[0] || !sensorRange.max[0]) {
                    sensorRange.max[0] = preAvg.sensor1.movingAverage();
                }
                if (preAvg.sensor2.movingAverage() > sensorRange.max[1] || !sensorRange.max[1]) {
                    sensorRange.max[1] = preAvg.sensor2.movingAverage();
                }
            } else {
                angle1 = mapValues(data[0], sensorRange.min[0], sensorRange.max[0], 0, 100);
                angle2 = mapValues(data[1], sensorRange.min[1], sensorRange.max[1], 0, 100);

                if (!flappyPlay) {
                    //for regular functionality
                    notify(false);

                    avg.sensor1.push(Date.now(), angle1);
                    avg.sensor2.push(Date.now(), angle2);

                    //console.log(avg.sensor1.movingAverage(), avg.sensor2.movingAverage())
                    var date = new Date;

                    if (avg.sensor1.movingAverage() < 40){
                        console.log(`Hand too far up at time ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}, moving avg is ${avg.sensor1.movingAverage()}`);
                        vibrationOn();
                    } else if (avg.sensor2.movingAverage() < 40) {
                        console.log(`Hand too far down at time ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}, moving avg is ${avg.sensor2.movingAverage()}`);
                        vibrationOn();
                    } else {
                        vibrationOff();
                    }
                } else {
                    //for flappy bird
                    notify(true);

                    flappyAvg.sensor1.push(Date.now(), angle1);
                    flappyAvg.sensor2.push(Date.now(), angle2);

                    if (avg.sensor1.movingAverage() < 40){
                        startFlapTime = Date.now();
                    } else if (avg.sensor2.movingAverage() < 40 && Date.now() < startFlapTime + 2000) {
                        flap();
                    }
                }
            }

        } catch (err){
            //console.log('ERROR: ' + err);
        }

    });
});

function mapValues(value, min, max, newMin, newMax) {
    var newValue = (value - min) * (newMax - newMin) / (max - min) + newMin;

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
        serialPort.write('Y');
        //console.log('Y');
    }
}

function vibrationOff() {
    if (vibrationState) {
        vibrationState = false;
        serialPort.write('N');
        //console.log('N');
    }
}

function flap(){
    robot.keyTap("space");
}

function notify(value){
    if (value && !flappyState) {
        serialPort.write('Z');
        flappyState = true;
    } else if (!value && flappyState) {
        serialPort.write('X');
        flappyState = false;
    }
}
