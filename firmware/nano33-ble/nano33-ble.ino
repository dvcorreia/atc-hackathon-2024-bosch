#include <ArduinoBLE.h>
// #include <Arduino_LSM9DS1.h>

// Bluetooth® Low Energy Custom Cycle Time Service
BLEService configService("FFF0");

// Cycle Time Characteristic
// remote clien will be able to get notifications if this characteristic changes
BLEIntCharacteristic profileCharacteristic("FFF1", BLERead | BLEWrite);

long previousMillis = 0;  // last time the cycle time was checked, in ms

void exit(int code) {
  if (code != 0) {
    Serial.print("error: code=");
    Serial.println(code);
  }
  while (1);
}

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // initialize the built-in LED pin to indicate when a central is connected
  pinMode(LED_BUILTIN, OUTPUT);

  // if analog input pin 0 is unconnected, random analog
  // noise will cause the call to randomSeed() to generate
  // different seed numbers each time the sketch runs.
  // randomSeed() will then shuffle the random function.
  randomSeed(analogRead(0));

  if (!BLE.begin()) {
    Serial.println("error: failed to initialize BLE!");
    exit(1);
  }
  
  /* Set a local name for the Bluetooth® Low Energy device
     This name will appear in advertising packets
     and can be used by remote devices to identify this Bluetooth® Low Energy device
     The name can be changed but maybe be truncated based on space left in advertisement packet
  */
  BLE.setDeviceName("NERVOUS-SYS-BLE");
  BLE.setLocalName("NERVOUS-SYS-BLE");
  BLE.setAdvertisedService(configService); // add service UUID
  configService.addCharacteristic(profileCharacteristic); // add the cycle time characteristic
  BLE.addService(configService); // Add the cycle time service

  /* Start advertising Bluetooth® Low Energy. It will start continuously transmitting Bluetooth® Low Energy
     advertising packets and will be visible to remote Bluetooth® Low Energy central devices
     until it receives a new connection */

  // start advertising
  BLE.advertise();

  Serial.println("Bluetooth® device active, waiting for connections...");
}

void loop() {
  // wait for a Bluetooth® Low Energy central
  BLEDevice central = BLE.central();

  // if a central is connected to the peripheral:
  if (central) {
    Serial.print("Connected to central: ");
    // print the central's BT address:
    Serial.println(central.address());
    // turn on the LED to indicate the connection:
    digitalWrite(LED_BUILTIN, HIGH);

    // generate a cycle time every 200ms
    // while the central is connected:
    while (central.connected()) {
      long currentMillis = millis();

      // if 200ms have passed, update the cycle time:
      if (currentMillis - previousMillis >= 200) {
        previousMillis = currentMillis;
        Serial.println("connected to central");
      }

      if (profileCharacteristic.written()) {
        // Read the value that was written by the central
        byte value = profileCharacteristic.value();

        // Do something with the value
        Serial.print("Value written by central: ");
        Serial.println(value);
      }
    }

    // when the central disconnects, turn off the LED:
    digitalWrite(LED_BUILTIN, LOW);
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}