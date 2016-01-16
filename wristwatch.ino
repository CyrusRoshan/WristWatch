void setup() {
    pinMode(9, OUTPUT);
    Serial.begin(9600);
}

// the loop routine runs over and over again forever:
void loop() {
    Serial.print("[");
    Serial.print(analogRead(A0));
    Serial.print(", ");
    Serial.print(analogRead(A1));
    Serial.print(", ");
    Serial.print(digitalRead(8));
    Serial.println("]");
    delay(10);
}

void serialEvent() {
    while (Serial.available()) {
        char inChar = (char)Serial.read();
        if (inChar == '0') {
            digitalWrite(9, HIGH);
        } else if ( inChar == '1') {
            digitalWrite(9, LOW);
        }
    }
}
