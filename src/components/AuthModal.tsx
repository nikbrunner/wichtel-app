import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { Mail } from "lucide-react";
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

  // Post-submit UI state (not form data)
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    onSubmit: async ({ value }) => {
      if (authModal.activeTab === "login") {
        await signIn({ data: { email: value.email, password: value.password } });
        handleClose();
        toast.success("Willkommen zuruck!");
        router.invalidate();
      } else {
        await signUp({ data: { email: value.email, password: value.password } });
        setSignupEmail(value.email);
        setSignupSuccess(true);
      }
    }
  });

  const resetForm = () => {
    form.reset();
    setSignupSuccess(false);
    setSignupEmail("");
  };

  const handleClose = () => {
    resetForm();
    authModal.close();
  };

  const handleTabChange = (value: string) => {
    form.reset();
    authModal.setTab(value as "login" | "signup");
  };

  if (signupSuccess) {
    return (
      <Dialog open={authModal.isOpen} onOpenChange={open => !open && handleClose()}>
        <DialogContent>
          <div className="flex flex-col items-center gap-6 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-3 border-black bg-green-100">
              <Mail className="h-8 w-8 text-green-700" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Bestatigungsmail gesendet!</h2>
              <p className="text-gray-600">
                Wir haben eine E-Mail an{" "}
                <span className="font-semibold text-black">{signupEmail}</span>{" "}
                gesendet.
              </p>
              <p className="text-gray-600">
                Bitte klicke auf den Link in der E-Mail, um dein Konto zu aktivieren.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <p>Keine E-Mail erhalten? Prufe deinen Spam-Ordner.</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Verstanden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={authModal.isOpen}>
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
            <form
              onSubmit={e => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="flex flex-col gap-4 p-10">
                <form.Field name="email">
                  {field => (
                    <div className="flex flex-col gap-1">
                      <label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="deine@email.de"
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        onBlur={field.handleBlur}
                        required
                        variant="pink"
                        autoFocus
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="password">
                  {field => (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="login-password"
                        className="text-sm font-medium"
                      >
                        Passwort
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Dein Passwort"
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        onBlur={field.handleBlur}
                        required
                        variant="success"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Subscribe selector={state => state.errors}>
                  {errors =>
                    errors.length > 0 && (
                      <p className="text-red-600 text-sm">{errors.join(", ")}</p>
                    )
                  }
                </form.Subscribe>
              </div>

              <DialogFooter>
                <form.Subscribe selector={state => state.isSubmitting}>
                  {isSubmitting => (
                    <>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Abbrechen
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Wird eingeloggt..." : "Einloggen"}
                      </Button>
                    </>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="flex flex-col gap-4 p-10">
                <form.Field name="email">
                  {field => (
                    <div className="flex flex-col gap-1">
                      <label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="deine@email.de"
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        onBlur={field.handleBlur}
                        required
                        variant="pink"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="password"
                  validators={{
                    onChange: ({ value }) =>
                      value.length > 0 && value.length < 6
                        ? "Passwort muss mindestens 6 Zeichen haben"
                        : undefined
                  }}
                >
                  {field => (
                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="signup-password"
                        className="text-sm font-medium"
                      >
                        Passwort
                      </label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mindestens 6 Zeichen"
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        onBlur={field.handleBlur}
                        required
                        variant="success"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-red-600 text-sm">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field
                  name="confirmPassword"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value, fieldApi }) => {
                      const password = fieldApi.form.getFieldValue("password");
                      return value && value !== password
                        ? "Passworter stimmen nicht uberein"
                        : undefined;
                    }
                  }}
                >
                  {field => (
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
                        value={field.state.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          field.handleChange(e.target.value)
                        }
                        onBlur={field.handleBlur}
                        required
                        variant="pink"
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-red-600 text-sm">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Subscribe selector={state => state.errors}>
                  {errors =>
                    errors.length > 0 && (
                      <p className="text-red-600 text-sm">{errors.join(", ")}</p>
                    )
                  }
                </form.Subscribe>
              </div>

              <DialogFooter>
                <form.Subscribe selector={state => state.isSubmitting}>
                  {isSubmitting => (
                    <>
                      <Button
                        type="button"
                        variant="link"
                        onClick={handleClose}
                        disabled={isSubmitting}
                      >
                        Abbrechen
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Wird erstellt..." : "Registrieren"}
                      </Button>
                    </>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
