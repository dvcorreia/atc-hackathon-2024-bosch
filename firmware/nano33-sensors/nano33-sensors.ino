/*
  Arduino LSM9DS1 - Simple Gyroscope

  This example reads the gyroscope values from the LSM9DS1
  sensor and continuously prints them to the Serial Monitor
  or Serial Plotter.

  The circuit:
  - Arduino Nano 33 BLE Sense

  created 10 Jul 2019
  by Riccardo Rizzo

  This example code is in the public domain.
*/

#include <Arduino_BMI270_BMM150.h> // Biblioteca para o IMU (acelerômetro e giroscópio)

void setup() {
  Serial.begin(9600);
  while (!Serial);
  Serial.println("Started");

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
//   Serial.print("Gyroscope sample rate = ");
//   Serial.print(IMU.gyroscopeSampleRate());
//   Serial.println(" Hz");
//   Serial.println();
//   Serial.println("Gyroscope in degrees/second");
//   Serial.println("X\tY\tZ");
}

void loop() {
    float xGyro, yGyro, zGyro;
    IMU.readGyroscope(xGyro, yGyro, zGyro);
    Serial.print("Giroscópio (°/s): ");
    Serial.print(xGyro, 3);
    Serial.print(", ");
    Serial.print(yGyro, 3);
    Serial.print(", ");
    Serial.println(zGyro, 3);
    delay(1000);
}