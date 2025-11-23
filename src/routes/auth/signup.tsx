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
import { signUp } from "~/server/auth/signUp";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length (Supabase default is 6)
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUp({ data: { email, password } });
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate({ to: "/auth/login" });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Stack gap="xl" maw={400} mx="auto" mt="xl">
        <Paper withBorder shadow="md" p={30} radius="md">
          <Stack gap="md" align="center">
            <Title order={3} c="green">
              Account created!
            </Title>
            <Text c="dimmed" ta="center">
              Your account has been created successfully. Redirecting to login...
            </Text>
          </Stack>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="xl" maw={400} mx="auto" mt="xl">
      <div>
        <Title order={2}>Create an account</Title>
        <Text c="dimmed" size="sm" mt={5}>
          Sign up to start organizing Secret Santa events
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
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.currentTarget.value)}
              required
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.currentTarget.value)}
              required
            />

            {error && (
              <Text c="red" size="sm">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth loading={isLoading}>
              Sign up
            </Button>
          </Stack>
        </form>

        <Text c="dimmed" size="sm" ta="center" mt="md">
          Already have an account?{" "}
          <Anchor size="sm" component="a" href="/auth/login">
            Sign in
          </Anchor>
        </Text>
      </Paper>
    </Stack>
  );
}
