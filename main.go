package main

import (
	"fmt"
	"machine"
	"time"

	"tinygo.org/x/drivers/lsm9ds1"
)

const (
	SHOW_ACCELERATION   = true
	SHOW_ROTATION       = true
	SHOW_MAGNETIC_FIELD = true
	SHOW_TEMPERATURE    = true
)

func main() {
	led := machine.LED1
	led.Configure(machine.PinConfig{Mode: machine.PinOutput})

	i2c := machine.I2C0
	err := i2c.Configure(machine.I2CConfig{
		SCL: machine.SCL_PIN,
		SDA: machine.SDA_PIN,
	})
	if err != nil {
		println("error: configuring I2C", err.Error())
		return
	}

	sensor := lsm9ds1.New(i2c)
	if err := sensor.Configure(lsm9ds1.Configuration{
		AccelRange:      lsm9ds1.ACCEL_2G,
		AccelSampleRate: lsm9ds1.ACCEL_SR_119,
		GyroRange:       lsm9ds1.GYRO_250DPS,
		GyroSampleRate:  lsm9ds1.GYRO_SR_119,
		MagRange:        lsm9ds1.MAG_4G,
		MagSampleRate:   lsm9ds1.MAG_SR_40,
	}); err != nil {
		for {
			println("error: failed to configure lsm9ds1", err.Error())
			time.Sleep(time.Second)
		}
	}

	for {
		if !sensor.Connected() {
			println("LSM9DS1 not connected")
			time.Sleep(time.Second)
			continue
		}

		ax, ay, az, _ := sensor.ReadAcceleration()
		gx, gy, gz, _ := sensor.ReadRotation()
		mx, my, mz, _ := sensor.ReadMagneticField()
		t, _ := sensor.ReadTemperature()

		printMonitor(ax, ay, az, gx, gy, gz, mx, my, mz, t)
		time.Sleep(time.Millisecond * 1000)
	}
}

func printMonitor(ax, ay, az, gx, gy, gz, mx, my, mz, t int32) {
	if SHOW_ACCELERATION {
		fmt.Printf("Acceleration (g): %f, %f, %f\r\n", axis(ax), axis(ay), axis(az))
	}
	if SHOW_ROTATION {
		fmt.Printf("Rotation (dps): %f, %f, %f\r\n", axis(gx), axis(gy), axis(gz))
	}
	if SHOW_MAGNETIC_FIELD {
		fmt.Printf("Magnetic field (nT): %d, %d, %d\r\n", mx, my, mz)
	}
	if SHOW_TEMPERATURE {
		fmt.Printf("Temperature C: %f\r\n", float32(t)/1000)
	}
	println()
}

func axis(raw int32) float32 {
	return float32(raw) / 1000000
}
