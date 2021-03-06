#include <RunningAverage.h>

RunningAverage myRA(30);
int samples = 0;
int motorPin = 12;   
int sensorValue = 0;         // the sensor value
int sensorMin = 1023;        // minimum sensor value
int sensorMax = 0;   
int runavg;
void setup() {
    Serial.begin(9600);
   pinMode(12, OUTPUT);
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
  Serial.println("Calibrating");
   // calibrate during the first five seconds
  while (millis() < 6000) {
    sensorValue = analogRead(A0);

    // record the maximum sensor value
    if (sensorValue > sensorMax) {
      sensorMax = sensorValue;
    }

    // record the minimum sensor value
    if (sensorValue < sensorMin) {
      sensorMin = sensorValue;
    }
  }

  // signal the end of the calibration period
  digitalWrite(13, LOW);
}

// the loop routine runs over and over again forever:
void loop() {
//  int UpperValue = analogRead(A5);
//  int LowerValue = analogRead(A0);
//  int MidValue = analogRead(A3);
//  
//  Serial.print(UpperValue);
//  Serial.print(",");
//  Serial.print(MidValue);
//  Serial.print(",");
// read the sensor:
  sensorValue = analogRead(A0);

  // apply the calibration to the sensor reading
  sensorValue = map(sensorValue, sensorMin, sensorMax, 0, 255);

  // in case the sensor value is outside the range seen during calibrations
  sensorValue = constrain(sensorValue, 0, 255);


  
  long rn = sensorValue;
  myRA.addValue(rn);
  samples++;
  Serial.print("Running Average: ");
  Serial.println(myRA.getAverage(), 3);
  runavg = myRA.getAverage();
  if ( runavg >= 170)
  {
  digitalWrite(motorPin, HIGH);
  }
  if (sensorValue < 170)
  {
    digitalWrite(motorPin, LOW);
  }

  if (samples == 600)
  {
    samples = 0;
    myRA.clear();
  }
  delay(100);

  Serial.println(sensorValue);

}

