import { Link } from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto mt-12 p-6">
      <h2 className="font-head text-2xl">Seite nicht gefunden</h2>

      <p className="text-muted-foreground text-center">
        {children || "Die Seite, die du suchst, existiert nicht."}
      </p>

      <div className="flex gap-4">
        <Button onClick={() => window.history.back()}>Zurück</Button>
        <Button asChild variant="outline">
          <Link to="/">Zur Startseite</Link>
        </Button>
      </div>
    </div>
  );
}
