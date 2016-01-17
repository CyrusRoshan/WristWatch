int sensor1 = 0;
int sensor2 = 0;
int flappyPin = 0;
int button = 0;



void setup() {
    pinMode(9, OUTPUT);
    Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
    sensor1 = analogRead(A0);
    sensor2 = analogRead(A1);
    flappyPin = analogRead(A2);
    button = digitalRead(A3);

    Serial.print("[");
    Serial.print(sensor1);
    Serial.print(", ");
    Serial.print(sensor2);
    Serial.print(", ");
    Serial.print(flappyPin);
    Serial.println("]");
    delay(10);
}

void serialEvent() {
    while (Serial.available()) {
        char inChar = (char)Serial.read();
        if (inChar == 'Y') {
            digitalWrite(9, HIGH);
        } else if (inChar == 'N') {
            digitalWrite(9, LOW);
        } else if (inChar == 'Z') {
            digitalWrite(13, HIGH);
        } else if (inChar == 'X') {
            digitalWrite(13, LOW);
        }
    }
}
