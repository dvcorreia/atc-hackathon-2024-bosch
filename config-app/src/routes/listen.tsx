import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/listen')({
  component: Listen,
})

function Listen() {
    return (
        <p>To be implemented ...</p>
    )
}