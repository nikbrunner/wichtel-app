import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter
} from "@/components/retroui/Dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthModal } from "~/stores/authModal";
import { signIn } from "~/server/auth/signIn";
import { signUp } from "~/server/auth/signUp";

export function AuthModal() {
  const router = useRouter();
  const authModal = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    authModal.close();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn({ data: { email, password } });
      handleClose();
      toast.success("Willkommen zuruck!");
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passworter stimmen nicht uberein");
      return;
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen haben");
      return;
    }

    setIsLoading(true);

    try {
      await signUp({ data: { email, password } });
      handleClose();
      toast.success("Konto erstellt! Du bist jetzt eingeloggt.");
      router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setError(null);
    authModal.setTab(value as "login" | "signup");
  };

  return (
    <Dialog open={authModal.isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent>
        <DialogHeader asChild>
          <Tabs value={authModal.activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <Tabs value={authModal.activeTab} onValueChange={handleTabChange}>
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-4 p-10">
                <div className="flex flex-col gap-1">
                  <label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    variant="pink"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="login-password" className="text-sm font-medium">
                    Passwort
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                    variant="success"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Wird eingeloggt..." : "Einloggen"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignup}>
              <div className="flex flex-col gap-4 p-10">
                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="deine@email.de"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                    variant="pink"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Passwort
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mindestens 6 Zeichen"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                    variant="success"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="signup-confirm-password"
                    className="text-sm font-medium"
                  >
                    Passwort bestatigen
                  </label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Passwort wiederholen"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    variant="pink"
                  />
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Abbrechen
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Wird erstellt..." : "Registrieren"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
