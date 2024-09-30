import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import {
  Ruler,
  Home
} from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="flex justify-between items-center p-4 text-primary-foreground">
        <Link to='/'>
          <Button size="icon" className="text-primary-foreground">
            <Home className="h-6 w-6" />
          </Button>
        </Link>
        <Link to='/measure-cycletime'>
          <Button variant="secondary" className="bg-secondary text-secondary-foreground">
            <Ruler className="mr-2 h-4 w-4" />
            New Measurement
          </Button>
        </Link>
      </nav>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  )
}
