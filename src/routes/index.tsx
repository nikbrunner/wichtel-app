import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { useAuthModal } from "~/stores/authModal";
import { Logo } from "~/components/Logo";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LandingPage
});

function LandingPage() {
  const authModal = useAuthModal();

  return (
    <div className="flex flex-col gap-12 py-8 sm:py-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-6">
        <Logo size="5xl" />
        <h1 className="text-4xl sm:text-6xl font-black max-w-3xl">
          Organisiere dein Wichteln ganz einfach
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Erstelle ein geheimes Wichtel-Event für deine Familie oder Freunde.
          Teilnehmer teilen ihre Wünsche und ziehen dann geheim einen Namen - niemand
          sieht, wer wen beschenkt!
        </p>
        <div className="flex gap-4 mt-4">
          <Button size="lg" onClick={() => authModal.open("signup")}>
            Jetzt starten
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => authModal.open("login")}
          >
            Anmelden
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="p-6" variant="info">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">🎁</span>
            <h3 className="text-lg font-bold">Wunschlisten</h3>
            <p className="text-sm">
              Teilnehmer können ihre Interessen und Wünsche teilen - so weiß jeder,
              was dem anderen gefällt.
            </p>
          </div>
        </Card>

        <Card className="p-6" variant="success">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">🎲</span>
            <h3 className="text-lg font-bold">Geheime Zulosung</h3>
            <p className="text-sm">
              Jeder zieht selbst einen Namen - komplett geheim, auch du als
              Organisator siehst nichts.
            </p>
          </div>
        </Card>

        <Card className="p-6" variant="pink">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">🔗</span>
            <h3 className="text-lg font-bold">Einfache Links</h3>
            <p className="text-sm">
              Keine Accounts für Teilnehmer nötig. Jeder bekommt einen eigenen Link
              per WhatsApp, Signal oder E-Mail.
            </p>
          </div>
        </Card>
      </div>

      {/* How it works Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          So funktioniert's
        </h2>
        <div className="grid sm:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">1</span>
              <p className="text-sm">Event erstellen & Teilnehmer hinzufügen</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">2</span>
              <p className="text-sm">Links an alle verschicken</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">3</span>
              <p className="text-sm">Teilnehmer tragen Wünsche ein</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">4</span>
              <p className="text-sm">Jeder zieht geheim einen Namen</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">5</span>
              <p className="text-sm">Geschenke besorgen & Spaß haben!</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
