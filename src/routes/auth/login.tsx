import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Title,
  Text,
  Anchor,
  Paper
} from "@mantine/core";
import { useState } from "react";
import { signIn } from "~/server/auth/signIn";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn({ data: { email, password } });
      // TODO: Navigate to dashboard once it's created
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="xl" maw={400} mx="auto" mt="xl">
      <div>
        <Title order={2}>Welcome back</Title>
        <Text c="dimmed" size="sm" mt={5}>
          Sign in to manage your Secret Santa events
        </Text>
      </div>

      <Paper withBorder shadow="md" p={30} radius="md">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              required
              type="email"
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              required
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth loading={isLoading}>
              Sign in
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Don't have an account?{" "}
          <Anchor size="sm" component="a" href="/auth/signup">
            Sign up
          </Anchor>
        </Text>
      </Paper>
    </Stack>
  );
}
