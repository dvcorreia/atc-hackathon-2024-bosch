import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import {
  Ruler,
  Notebook,
  Worm,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Link to='/'>
            <Button variant="outline" size="icon" aria-label="Home">
              <Worm className="size-5 fill-foreground" />
            </Button>
          </Link>
        </div>
        <nav className="grid gap-1 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/measure">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg bg-muted"
                  aria-label="Measure"
                >
                  <Ruler className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Measure
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to='/study'>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg"
                  aria-label="Study"
                >
                  <Notebook className="size-5" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5}>
              Study
            </TooltipContent>
          </Tooltip>
        </nav>
      </aside>
      
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  )
}