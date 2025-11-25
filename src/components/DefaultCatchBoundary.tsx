import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/retroui/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/retroui/Alert";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: state => state.id === rootRouteId
  });

  console.error(error);

  return (
    <div className="flex flex-col items-center gap-6 max-w-xl mx-auto mt-12 p-6">
      <h2 className="font-head text-2xl">Etwas ist schiefgelaufen</h2>

      <Alert variant="danger" className="w-full">
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>
          <ErrorComponent error={error} />
        </AlertDescription>
      </Alert>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            router.invalidate();
          }}
        >
          Erneut versuchen
        </Button>
        {isRoot ? (
          <Button asChild variant="outline">
            <Link to="/">Zur Startseite</Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            Zurück
          </Button>
        )}
      </div>
    </div>
  );
}
