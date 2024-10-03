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

type State int

const (
	IDLE      = 0
	MEASURING = 1
)

func Abs(x float32) float32 {
	if x < 0 {
		return -1 * x
	}
	return x
}

var (
	state     State = IDLE
	startTime uint
	endTime   uint
	threshold float32 = 80.0
)

var LED = getPinLED()

func setup() {
	pinMode(LED, 1)
	digitalWrite(LED, LOW)
}

var magX, magY, magZ float32

func loop() {
	imuMagRead(&magX, &magY, &magZ)

	magStrenght := Abs(magX) + Abs(magY) + Abs(magZ)

	if magStrenght == 0 {
		return
	}

	printFloat(magStrenght)
	if magStrenght > threshold {
		if state == IDLE {
			startTime = millis()
			state = MEASURING
			digitalWrite(LED, HIGH)
		}
	} else {
		if state == MEASURING {
			endTime = millis() - startTime
			state = IDLE
			digitalWrite(LED, LOW)
		}
	}
}

func main() {
	setup()
	for {
		loop()
	}
}
