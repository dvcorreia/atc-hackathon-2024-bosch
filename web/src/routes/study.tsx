import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/study')({
  component: Study,
})

function Study() {
  return <div className="p-2">Hello from Study!</div>
}
