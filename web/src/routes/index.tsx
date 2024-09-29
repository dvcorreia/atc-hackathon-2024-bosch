import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
        <h1 className="text-xl font-semibold">Nervous System</h1>
      </header>
      <div className='p-4'>
        <Link to='/measure'>
          <Button>Take a measurement!</Button>
        </Link>
      </div>
    </div>
  )
}
