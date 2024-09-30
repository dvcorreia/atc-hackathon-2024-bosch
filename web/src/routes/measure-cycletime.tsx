import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { createMachine } from 'xstate';
import { useMachine } from '@xstate/react';

import { Bluetooth } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

const cycleTimeServiceUUID = 0xFFF0
const cycleTimeCharacteristicUUID = 0xFFF1

const cycleTimeMeasureMachine = createMachine({
    id: "cycle-time",
    initial: "initial",
    states: {
        "initial": {
            on: {
                DEVICE_CONNECTED: 'connected'
            }
        },
        "connected": {
            on: {
                START_MEASURE: 'measuring',
                DEVICE_DICONNECTED: 'initial',
            }
        },
        "measuring": {
            on: {
                FINISH_MEASURE: 'results',
                DEVICE_DICONNECTED: 'initial',
            }
        },
        "results": {
            on: {
                NEW_MEASUREMENT: 'initial'
            }
        }
    }
})

export const Route = createFileRoute('/measure-cycletime')({
  component: () => {
    const [state, send] = useMachine(cycleTimeMeasureMachine);

    return (
        <main className="flex-grow flex items-center justify-center p-4">
            {state.matches('initial') && <Initial />}
            {state.matches('connected') && <Connected />}
            {state.matches('measuring') && <Measuring />}
            {state.matches('results') && <Results />}
        </main>
    )
  },
})

function Initial() {
    return (
        <div>
            <ConnectToBLEDevice />
        </div>
    )
}

function Connected() {
    return (
        <div>
            Connected state
        </div>
    )
}

function Measuring() {
    return (
        <div>
            Measuring state
        </div>
    )
}

function Results() {
    return (
        <div>
            Results state
        </div>
    )
}

function ConnectToBLEDevice() {
    const { toast } = useToast()

    const [connected, setConnected] = useState(false)
    const [tsCharacteristic, setTsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>()
    const [isMeasuring, setIsMeasuring] = useState(false)

    function connectBLEDevice() {
        if (!navigator.bluetooth) {
          console.error("BLE not supported in your browser or computer")
          return
        }
    
        const options: RequestDeviceOptions = {
          filters: [{
              services: [cycleTimeServiceUUID]
          }]
        }
    
        navigator.bluetooth.requestDevice(options).then(device => {
          device.addEventListener("gattserverdisconnected", onDisconnect)
          return device.gatt?.connect()
        }).then(server => {
          setConnected(true)
          return server?.getPrimaryService(cycleTimeServiceUUID)
        }).then(service => {
          return service?.getCharacteristic(cycleTimeCharacteristicUUID)
        }).then(c => {
          setTsCharacteristic(c)
        })
    }

    function onDisconnect() {
        setConnected(false)
        toast({
            title: "BLE Device lost!",
            description: "Disconnection from the Bluetooth device",
            variant: "destructive",
            action: <ToastAction altText='Reconnect' onClick={connectBLEDevice}>Reconnect</ToastAction>
        })
    }

    function consumeTs(event: Event) {
        // @ts-ignore
        const value = event?.target?.value.getUint8(0);
        console.log(value)
    }
    
    function startMeasure() {
        tsCharacteristic?.startNotifications().then(c => {
          setIsMeasuring(true)
          c?.addEventListener("characteristicvaluechanged", consumeTs)
        })
    }
    
    function stopMeasure() {
        tsCharacteristic?.stopNotifications().then(_ => {
          tsCharacteristic?.removeEventListener("characteristicvaluechanged", consumeTs)
          setIsMeasuring(false)
        })
    }

    return (
        <Button onClick={connectBLEDevice} disabled={connected}>
            <Bluetooth className="mr-2 h-4 w-4" />
            Connect with BLE Device
        </Button>
    )
}