#include <ArduinoBLE.h>
// #include <Arduino_LSM9DS1.h>

// Bluetooth® Low Energy Custom Cycle Time Service
BLEService cycleTimeService("FFF0");

// Cycle Time Characteristic
// remote clients will be able to get notifications if this characteristic changes
BLEIntCharacteristic ts("FFF1", BLERead | BLENotify);

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

  if (!BLE.begin()) {
    Serial.println("error: failed to initialize BLE!");
    exit(1);
  }
  
  BLE.setLocalName("NERVOUS-SYS-BLE");
  BLE.setAdvertisedService(cycleTimeService); // add service UUID
  cycleTimeService.addCharacteristic(ts); // add the cycle time characteristic
  BLE.addService(cycleTimeService); // Add the cycle time service

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
        Serial.println("wewe")
      }
    }

    // when the central disconnects, turn off the LED:
    digitalWrite(LED_BUILTIN, LOW);
    Serial.print("Disconnected from central: ");
    Serial.println(central.address());
  }
}