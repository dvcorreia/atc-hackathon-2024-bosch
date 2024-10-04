import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Bluetooth } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

const cycleTimeServiceUUID = 0xFFF0
const cycleTimeCharacteristicUUID = 0xFFF1

export const Route = createFileRoute('/listen')({
  component: Listen,
})

function Listen() {
    const [packets, usePackets] = useState<string[]>([])

    function onListen() {
        navigator.bluetooth.requestLEScan({
            filters: [{
                services: [cycleTimeServiceUUID]
            }]
        }).then(scan => {
            console.debug('Scan started with:');
            console.debug(' acceptAllAdvertisements: ' + scan.acceptAllAdvertisements);
            console.debug(' active: ' + scan.active);
            console.debug(' keepRepeatedDevices: ' + scan.keepRepeatedDevices);
            console.debug(' filters: ' + JSON.stringify(scan.filters));
        })

        navigator.bluetooth.addEventListener("advertisementreceived", e => {
            e.serviceData.forEach((valueDataView, key) => {
                const textDecoder = new TextDecoder('ascii');
                const asciiString = textDecoder.decode(valueDataView.buffer);
                usePackets([asciiString, ...packets])
            });
        })
    }

    return (
        <main className="flex-grow flex items-center justify-center p-4">
            <Button onClick={onListen}>
                <Bluetooth className="mr-2 h-4 w-4" />
                Listen for BLE advertisements
            </Button>
            <hr />
            <ul>
                {packets.map((packet, index) => (
                <li key={index}>{packet}</li>
                ))}
            </ul>
        </main>
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