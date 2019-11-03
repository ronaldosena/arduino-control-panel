//#define DEBUG
#define TOGGLE_LED 0x41
#define START_ACQ 0x42
#define STOP_ACQ 0x43

#include <TimerOne.h>

#define pinCh1 A0
#define timerPeriod 1000 // in microseconds

const byte ID_begin = 0x0A;
const byte ID_end = 0xA0;

boolean sendFlag = false;
uint16_t valueCh1, valueCh2;
uint8_t incomingBuffer[1];

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  Timer1.initialize(timerPeriod);
  Timer1.attachInterrupt(callback);

  while (!Serial); // for native usb chips
}

void loop()
{
  if(Serial.available() > 0)
  {
    Serial.readBytes(incomingBuffer, 1);

    if(incomingBuffer[0] == TOGGLE_LED)
      digitalWrite(LED_BUILTIN,!digitalRead(LED_BUILTIN));

    if(incomingBuffer[0] == START_ACQ)
      sendFlag = true;

    if(incomingBuffer[0] == STOP_ACQ)
      sendFlag = false;   
  }
}

void callback()
{
  if(sendFlag)
  {
    valueCh1 = analogRead(pinCh1);
    
    #ifdef DEBUG
      Serial.println(valueCh1);
    #else
      Serial.write(ID_begin);
      Serial.write((uint8_t) (valueCh1 >> 8));
      Serial.write((uint8_t) (valueCh1 & 0xFF));
      Serial.write(ID_end);
    #endif
  }
}
