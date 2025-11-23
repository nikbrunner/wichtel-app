import { createFileRoute } from '@tanstack/react-router'
import { Button, Stack, Title } from '@mantine/core'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <Stack p="md" gap="md">
      <Title order={2}>Welcome Home!!!</Title>
      <Button variant="filled" color="blue">
        Test Mantine Button
      </Button>
    </Stack>
  )
}
