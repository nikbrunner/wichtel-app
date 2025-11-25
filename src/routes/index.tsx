import { createFileRoute, redirect } from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { useAuthModal } from "~/stores/authModal";

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
        <span className="text-6xl sm:text-8xl">🎁</span>
        <h1 className="text-4xl sm:text-6xl font-black max-w-3xl">
          Organisiere dein Wichteln ganz einfach
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
          Erstelle ein geheimes Wichtel-Event fur deine Familie oder Freunde. Niemand
          sieht, wer wen beschenkt - auch du nicht als Organisator!
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
            <span className="text-3xl">🎲</span>
            <h3 className="text-lg font-bold">Geheime Zulosung</h3>
            <p className="text-sm text-muted-foreground">
              Jeder Teilnehmer zieht selbst einen Namen - komplett geheim und ohne
              dass du als Organisator etwas siehst.
            </p>
          </div>
        </Card>

        <Card className="p-6" variant="success">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">🔗</span>
            <h3 className="text-lg font-bold">Einfache Links</h3>
            <p className="text-sm text-muted-foreground">
              Keine Accounts fur Teilnehmer notig. Jeder bekommt einen eigenen Link
              zum Ziehen.
            </p>
          </div>
        </Card>

        <Card className="p-6" variant="pink">
          <div className="flex flex-col gap-3">
            <span className="text-3xl">📱</span>
            <h3 className="text-lg font-bold">Uberall nutzbar</h3>
            <p className="text-sm text-muted-foreground">
              Funktioniert auf jedem Gerat - perfekt zum Teilen per WhatsApp, Signal
              oder Email.
            </p>
          </div>
        </Card>
      </div>

      {/* How it works Section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          So funktioniert's
        </h2>
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">1</span>
              <p className="text-sm">Event erstellen & Teilnehmer hinzufugen</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">2</span>
              <p className="text-sm">Links an alle Teilnehmer verschicken</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">3</span>
              <p className="text-sm">Jeder zieht selbst einen Namen</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col gap-2 items-center text-center">
              <span className="text-2xl font-bold text-primary">4</span>
              <p className="text-sm">Geschenke besorgen & Spass haben!</p>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="flex flex-col items-center gap-4 py-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          Bereit fur dein Wichtel-Event?
        </h2>
        <Button size="lg" onClick={() => authModal.open("signup")}>
          Kostenlos starten
        </Button>
      </div>
    </div>
  );
}
