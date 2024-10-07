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
//go:export getPinRedLED
func getPinRedLED() uint

//go:wasm-module arduino
//go:export getPinGreenLED
func getPinGreenLED() uint

//go:wasm-module arduino
//go:export getPinBlueLED
func getPinBlueLED() uint

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
//go:export imuAccelRead
func imuAccelRead(x *float32, y *float32, z *float32)

//go:wasm-module arduino
//go:export gestureRead
func gestureRead() uint

//go:wasm-module arduino
//go:export advBLETs
func advBLETs(frameCounter uint16, elapsedTime uint)

//go:wasm-module arduino
//go:export stopAdvBLE
func stopAdvBLE()

//go:wasm-module arduino
//go:export blePool
func blePool()

const (
	GESTURE_UP uint = iota
	GESTURE_DOWN
	GESTURE_LEFT
	GESTURE_RIGHT
	UNKNOW = 5
)

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
	state        State = IDLE
	startTime    uint
	frameCounter uint16
	elapsedTime  uint
	threshold    float32 = 1.8
	numtries     uint    = 3
	gesture      uint
	count        uint = 0
)

var (
	LED  = getPinLED()
	LEDR = getPinRedLED()
	LEDG = getPinGreenLED()
	LEDB = getPinBlueLED()
)

func setup() {
	pinMode(LED, 1)

	pinMode(LEDR, 1)
	pinMode(LEDG, 1)
	pinMode(LEDB, 1)

	digitalWrite(LED, LOW)

	digitalWrite(LEDR, HIGH)
	digitalWrite(LEDG, LOW)
	digitalWrite(LEDB, HIGH)
}

var acX, acY, acZ float32

func loop() {
	gesture = gestureRead()
	if gesture == GESTURE_DOWN {
		if state == IDLE {
			startTime = millis()
			state = MEASURING
			digitalWrite(LED, LOW)
		}
		for count < numtries {
			imuAccelRead(&acX, &acY, &acZ)
			accelStrenght := Abs(acX) + Abs(acY) + Abs(acZ)
			if accelStrenght > threshold {
				count = count + 1
				delay(100)
			}
		}
		elapsedTime = millis() - startTime
		state = IDLE
		count = 0
		digitalWrite(LED, HIGH)
		frameCounter++
		stopAdvBLE()
		advBLETs(frameCounter, elapsedTime)

	}
	blePool()
}

func main() {
	setup()
	for {
		loop()
	}
}
