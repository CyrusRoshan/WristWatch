// this code is incredibly hacky. Look at it thoroughly and you'll see why...
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var robot = require("robotjs");
var MA = require('moving-average');
var localtunnel = require('localtunnel');
var koa = require('koa');
var route = require('koa-route');
var cors = require('koa-cors');
var app = koa();

app.use(cors());

var preAvgTimeInterval = 2.5 * 1000;
var timeInterval = 30 * 1000;
var flappyTimeInterval = 0.25 * 1000;

var preAvg = {sensor1: MA(preAvgTimeInterval), sensor2: MA(preAvgTimeInterval)};
var avg = {sensor1: MA(timeInterval), sensor2: MA(timeInterval)};
var flappyAvg = {sensor1: MA(flappyTimeInterval), sensor2: MA(flappyTimeInterval)};

var vibrationState = false;
var flappyState;

var startTime = Date.now();
var angle1;
var angle2;
var handPosition;
var flappyPlay = false;
var startFlapTime;

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
                    if (flappyState) {
                        console.log('REGULAR FUNCTIONALITY ENABLED');
                    }
                    notify(false);

                    avg.sensor1.push(Date.now(), angle1);
                    avg.sensor2.push(Date.now(), angle2);

                    //console.log(avg.sensor1.movingAverage(), avg.sensor2.movingAverage())
                    var date = new Date;

                    if (avg.sensor1.movingAverage() < 50){
                        console.log(`Hand too far up at time ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}, moving avg is ${avg.sensor1.movingAverage()}`);
                        handPosition = 'Too far up';
                        vibrationOn();
                    } else if (avg.sensor2.movingAverage() < 55) {
                        console.log(`Hand too far down at time ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}, moving avg is ${avg.sensor2.movingAverage()}`);
                        handPosition = 'Too far down';
                        vibrationOn();
                    } else {
                        vibrationOff();
                    }
                } else {
                    //for flappy bird
                    if (flappyState === false || flappyState === undefined) {
                        console.log('FLAPPY BIRD FUNCTIONALITY ENABLED');
                    }
                    notify(true);

                    flappyAvg.sensor1.push(Date.now(), angle1);
                    flappyAvg.sensor2.push(Date.now(), angle2);

                    if (flappyAvg.sensor1.movingAverage() < 65){
                        startFlapTime = Date.now();
                    } else if (flappyAvg.sensor2.movingAverage() < 65 && Date.now() < startFlapTime + 700) {
                        flap();
                        startFlapTime = 0;
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

function realAngle(){
    return (angle2 - angle1)/2;
}

try {
    var tunnel = localtunnel(3000, function(err, tunnel) {
        app.use(function *(){
            this.body = {
                angle: realAngle(),
                position: handPosition,
                angle1: angle1,
                angle2: angle2
            };
        });

        app.listen(3000);

        console.log('TUNNEL URL IS:', tunnel.url);
    });
} catch (err) {
    console.log('ERROR:', err);
}
