import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { Select } from "@/components/retroui/Select";
import { DatePicker } from "@/components/ui/date-picker";
import { createEvent } from "../server/createEvent";
import type { CreateEventOutput } from "../types/database";
import dayjs from "dayjs";
import { format } from "date-fns";

export const Route = createFileRoute("/new-event")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  component: Home
});

function useCopyToClipboard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return { copiedId, copy };
}

function Home() {
  const [result, setResult] = useState<CreateEventOutput | null>(null);
  const { copiedId, copy } = useCopyToClipboard();

  const initialParticipants = useMemo(
    () => [
      { id: crypto.randomUUID(), name: "" },
      { id: crypto.randomUUID(), name: "" },
      { id: crypto.randomUUID(), name: "" }
    ],
    []
  );

  // Lock date offset options (days before event)
  const lockDateOptions = [
    { value: "0", label: "Sofort (kein Stichtag)" },
    { value: "1", label: "1 Tag vorher" },
    { value: "2", label: "2 Tage vorher" },
    { value: "3", label: "3 Tage vorher" },
    { value: "7", label: "1 Woche vorher" },
    { value: "14", label: "2 Wochen vorher" }
  ];

  const form = useForm({
    defaultValues: {
      eventName: "",
      eventDate: undefined as Date | undefined,
      lockDateOffset: "3", // Default: 3 days before
      participants: initialParticipants
    },
    onSubmit: async ({ value }) => {
      if (!value.eventDate) {
        throw new Error("Event-Datum ist erforderlich");
      }

      const filteredNames = value.participants
        .map(p => p.name.trim())
        .filter(name => name.length > 0);

      // Calculate lock date from event date minus offset
      const offsetDays = parseInt(value.lockDateOffset, 10);
      const eventDateObj = dayjs(value.eventDate);
      const lockDateObj = eventDateObj.subtract(offsetDays, "day");

      // If lock date would be in the past, use today
      const today = dayjs().startOf("day");
      const finalLockDate = lockDateObj.isBefore(today) ? today : lockDateObj;

      const eventResult = await createEvent({
        data: {
          eventName: value.eventName.trim(),
          eventDate: format(value.eventDate, "yyyy-MM-dd"),
          lockDate: finalLockDate.format("YYYY-MM-DD"),
          participantNames: filteredNames
        }
      });

      setResult(eventResult);
    }
  });

  const resetForm = () => {
    form.reset();
    setResult(null);
  };

  if (result) {
    const adminLink = `${window.location.origin}/admin/${result.eventSlug}?token=${result.adminToken}`;

    return (
      <div className="flex flex-col gap-8 max-w-3xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-center">
          Wichtel-Event erstellt!
        </h1>

        <Alert variant="success">
          <AlertTitle>Erfolg</AlertTitle>
          <AlertDescription>
            Dein Wichtel-Event &quot;{result.eventSlug}&quot; wurde erstellt!
          </AlertDescription>
        </Alert>

        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xl font-semibold mb-3">Admin-Link (für dich):</p>
              <div className="flex gap-2">
                <Input readOnly value={adminLink} className="flex-1" />
                <Button
                  onClick={() => copy(adminLink, "admin")}
                  variant={copiedId === "admin" ? "default" : "outline"}
                >
                  {copiedId === "admin" ? "Kopiert" : "Kopieren"}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xl font-semibold mb-3">Teilnehmer-Links:</p>
              <div className="flex flex-col gap-3">
                {result.participants.map(participant => {
                  const participantLink = `${window.location.origin}${participant.link}`;
                  return (
                    <Card key={participant.token} className="p-4 bg-muted/30">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium">
                          {participant.name}
                        </span>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={participantLink}
                            className="flex-1 text-xs"
                          />
                          <Button
                            onClick={() => copy(participantLink, participant.token)}
                            variant={
                              copiedId === participant.token ? "default" : "outline"
                            }
                            size="sm"
                          >
                            {copiedId === participant.token ? "Kopiert" : "Kopieren"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={resetForm} variant="outline">
            Neues Event erstellen
          </Button>
          <Button asChild>
            <Link to="/">Zum Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-black mb-3">
          Wichtel-Event erstellen
        </h1>
        <p className="text-muted-foreground">
          Erstelle ein geheimes Wichtel-Event für deine Familie oder Freunde
        </p>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-4">
          <form.Field
            name="eventName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0 ? "Event-Name ist erforderlich" : undefined
            }}
          >
            {field => (
              <div className="flex flex-col gap-2">
                <label htmlFor="eventName" className="text-sm font-medium">
                  Event-Name
                </label>
                <Input
                  id="eventName"
                  placeholder="Weihnachten 2025"
                  value={field.state.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.handleChange(e.target.value)
                  }
                  onBlur={field.handleBlur}
                  required
                  variant="info"
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
            name="eventDate"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Event-Datum ist erforderlich";
                const selectedDate = dayjs(value);
                const today = dayjs().startOf("day");
                if (selectedDate.isBefore(today)) {
                  return "Event-Datum muss heute oder in der Zukunft liegen";
                }
                return undefined;
              }
            }}
          >
            {field => (
              <div className="flex flex-col gap-2 mb-2">
                <label className="text-sm font-medium">Event-Datum</label>
                <DatePicker
                  value={field.state.value}
                  onChange={date => field.handleChange(date)}
                  placeholder="Datum auswählen"
                  minDate={new Date()}
                />
                <p className="text-xs text-muted-foreground">
                  Die Ziehungsergebnisse werden erst nach diesem Datum sichtbar
                </p>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-red-600 text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="lockDateOffset">
            {field => (
              <div className="flex flex-col gap-2 mb-2">
                <label className="text-sm font-medium">Stichtag für Wünsche</label>
                <Select
                  value={field.state.value}
                  onValueChange={value => field.handleChange(value)}
                >
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Zeitraum auswählen" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {lockDateOptions.map(option => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Group>
                  </Select.Content>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Bis zum Stichtag können Teilnehmer ihre Wünsche eintragen. Danach
                  wird die Ziehung freigeschaltet.
                </p>
              </div>
            )}
          </form.Field>

          <div>
            <p className="text-xl font-semibold mb-3">Teilnehmer</p>
            <form.Field name="participants" mode="array">
              {field => (
                <>
                  <div className="flex flex-col gap-2">
                    {field.state.value.map((participant, index) => (
                      <form.Field
                        key={participant.id}
                        name={`participants[${index}].name`}
                      >
                        {subField => (
                          <div className="flex gap-2">
                            <Input
                              placeholder={`Teilnehmer ${index + 1}`}
                              value={subField.state.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                subField.handleChange(e.target.value)
                              }
                              className="flex-1"
                              required
                              variant="pink"
                            />
                            {field.state.value.length > 3 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.removeValue(index)}
                                className="text-red-600"
                              >
                                x
                              </Button>
                            )}
                          </div>
                        )}
                      </form.Field>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      field.pushValue({ id: crypto.randomUUID(), name: "" })
                    }
                    variant="outline"
                    className="w-full mt-2"
                  >
                    + Teilnehmer hinzufügen
                  </Button>
                </>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={state => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              errors: state.errors
            })}
          >
            {({ canSubmit, isSubmitting, errors }) => (
              <>
                {errors.length > 0 && (
                  <Alert variant="danger">
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{errors.join(", ")}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  size="lg"
                  className="w-full"
                  variant="success"
                >
                  {isSubmitting ? "Wird erstellt..." : "Event erstellen"}
                </Button>
              </>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
}
