import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Bluetooth } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

export const Route = createFileRoute('/measure/')({
  component: Measure,
})

const cycleTimeServiceUUID = 0xFFF0
const cycleTimeCharacteristicUUID = 0xFFF1

function Measure() {
  const { toast } = useToast()

  const [connected, setConnected] = useState(false)
  const [tsCharacteristic, setTsCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>()
  const [isMeasuring, setIsMeasuring] = useState(false)

  function onDisconnect() {
    setConnected(false)
    toast({
      title: "BLE Device lost!",
      description: "Disconnection from the Bluetooth device",
      variant: "destructive",
      action: <ToastAction altText='Reconnect' onClick={connectBLEDevice}>Reconnect</ToastAction>
    })
  }

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
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">Measure</h1>
      </header>
      <div className="p-4">
        <Button onClick={connectBLEDevice} disabled={connected}>
          <Bluetooth className="mr-2 h-4 w-4" />
          Connect with the BLE device
        </Button>
      </div>
      
      {connected && (
        <>
          <hr />
          <div className="p-4">
            <Button onClick={startMeasure} disabled={isMeasuring}>Start Measurement</Button>
            <Button onClick={stopMeasure} disabled={!isMeasuring}>Stop</Button>
          </div>
        </>
      )}
    </div>
  )
}

