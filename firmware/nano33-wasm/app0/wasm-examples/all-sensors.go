package main

/*
 * Arduino API
 */

const (
	LOW  = 0
	HIGH = 1

	INPUT        = 0
	OUTPUT       = 1
	INPUT_PULLUP = 2
)

//go:wasm-module arduino
//go:export millis
func millis() uint

//go:wasm-module arduino
//go:export delay
func delay(ms uint)

//go:wasm-module arduino
//go:export pinMode
func pinMode(pin, mode uint)

//go:wasm-module arduino
//go:export digitalWrite
func digitalWrite(pin, value uint)

//go:wasm-module arduino
//go:export getPinLED
func getPinLED() uint

//go:wasm-module arduino
//go:export print
func print(buf []byte, len uint32)

//go:wasm-module arduino
//go:export printInt
func printInt(i uint32)

//go:wasm-module arduino
//go:export printFloat
func printFloat(i float32)

//go:wasm-module arduino
//go:export imuGyroRead
func imuGyroRead(x *float32, y *float32, z *float32)

//go:wasm-module arduino
//go:export imuMagRead
func imuMagRead(x *float32, y *float32, z *float32)

//go:wasm-module arduino
//go:export advBLETs
func advBLETs(ts uint32)

//go:wasm-module arduino
//go:export stopAdvBLE
func stopAdvBLE()

//go:wasm-module arduino
//go:export blePool
func blePool()

/*
 * App
 */

var LED = getPinLED()
var count uint32

func setup() {
	pinMode(LED, 1)
}

func loop() {
	digitalWrite(LED, HIGH)
	delay(1000)
	digitalWrite(LED, LOW)
	delay(1000)

	// gyroReadData()
	// printFloat(gyrGetEix(0))
	// printFloat(gyrGetEix(1))
	// printFloat(gyrGetEix(2))
	var x, y, z float32

	imuGyroRead(&x, &y, &z)
	printFloat(x)
	printFloat(y)
	printFloat(z)

	count++
	printInt(count)

	imuMagRead(&x, &y, &z)
	printFloat(x)
	printFloat(y)
	printFloat(z)

	stopAdvBLE()
	advBLETs(1)
	blePool()
}

/*
 * Entry point
 */

func main() {
	setup()
	for {
		loop()
	}
}
