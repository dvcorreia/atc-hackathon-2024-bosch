import { createFileRoute } from '@tanstack/react-router'

import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bluetooth, LucideProps, Package, Wrench, Zap } from "lucide-react"
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

const configServiceUUID = 0xFFF0
const profileCharacteristicUUID = 0xFFF1

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { toast } = useToast()

  const [connected, setConnected] = useState<boolean>(false)
  const [device, setDevice] = useState<BluetoothDevice>()
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic>()

  function resetDevice() {
    setConnected(false)
    setDevice(undefined)
    setCharacteristic(undefined)
  }

  function onProfileSelected(profile: Profile) {
    const profileId = Uint8Array.of(profile.id)
    characteristic?.writeValue(profileId).then(() => {
      toast({
        title: `Configured device with Profile: ${profile.title} (id=${profile.id})`,
        description: profile.description,
      })
    }).then(() => {
      if (device) {
        device?.gatt?.disconnect()
        resetDevice()
      }
    }).catch(error => {
      console.error(error)
    })
  }

  useEffect(() => {
    if (device == undefined) {
      resetDevice()
      return
    }
    setConnected(true)

    device.gatt?.connect().then(server => {
      return server.getPrimaryService(configServiceUUID)
    }).then(service => {
      return service.getCharacteristic(profileCharacteristicUUID)
    }).then(chr => {
      setCharacteristic(chr)
    })
  }, [device])

  return (
    <main className="mx-auto p-4">
      <ConnectBLEButton onConnect={setDevice}/>
      {connected ? <Profiles onSelect={onProfileSelected}/> : null}
    </main>
  )
}

interface Profile {
  id: number;
  title: string;
  description: string;
  version: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}

interface ProfilesProps {
  onSelect: (id: Profile) => void
}

function Profiles(props: ProfilesProps) {
  const profiles = [
    {
      id: 0,
      title: "Standard Profile",
      description: "A basic profile for general use",
      version: "1.0.0",
      icon: Package,
    },
    {
      id: 1,
      title: "Developer Profile",
      description: "Advanced settings for developers",
      version: "2.3.1",
      icon: Wrench,
    },
    {
      id: 2,
      title: "Power User Profile",
      description: "Optimized for high-performance tasks",
      version: "1.5.2",
      icon: Zap,
    },
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile, index) => (
          <Card key={index} onClick={() => props.onSelect(profile)} className="flex flex-col hover:shadow-md hover:scale-102">
            <CardHeader className="flex-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">{profile.title}</CardTitle>
                <profile.icon className="h-12 w-12 text-primary" />
              </div>
              <CardDescription className="mt-2 text-sm text-muted-foreground">
                {profile.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                Version: <span className="font-mono">{profile.version}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface ConnectBLEButtonProps {
  onConnect: (device: BluetoothDevice) => void
}

function ConnectBLEButton(props: ConnectBLEButtonProps) {
  // const { toast } = useToast()

  const [device, setDevice] = useState<BluetoothDevice>()

  function onDisconnect() {
    setDevice(undefined)
    // toast({
    //     title: "BLE Device lost!",
    //     description: "Disconnection from the Bluetooth device",
    //     variant: "destructive",
    //     action: <ToastAction altText='Reconnect' onClick={connectBLEDevice}>Reconnect</ToastAction>
    // })
  }

  function connectBLEDevice() {
    if (!navigator.bluetooth) {
      console.error("BLE not supported in your browser or computer")
      return
    }

    const options: RequestDeviceOptions = {
      filters: [{
          services: [configServiceUUID]
      }]
    }

    navigator.bluetooth.requestDevice(options).then(device => {
      device.addEventListener("gattserverdisconnected", onDisconnect)
      setDevice(device)
      props.onConnect(device)
    })
  }

  function buttonDescription() {
    if (device) {
      return "Connected to device " + device.name 
    }
    return "Connect with BLE Device"
  }

  return (
    <Button onClick={connectBLEDevice} disabled={device != undefined}>
      <Bluetooth className="mr-2 h-4 w-4" />
      {buttonDescription()}
    </Button>
  )
}
