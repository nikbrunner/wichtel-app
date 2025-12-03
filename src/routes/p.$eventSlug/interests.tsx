import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Card } from "~/components/retroui/Card";
import { updateInterests } from "../../server/updateInterests";
import { deleteInterest } from "../../server/deleteInterest";
import { skipInterests } from "../../server/skipInterests";
import { getParticipantInfo } from "../../server/getParticipantInfo";

export const Route = createFileRoute("/p/$eventSlug/interests")({
  loader: async ({ params, location }) => {
    // Load participant info for this route
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    if (!token) {
      throw new Error("Token is required");
    }

    const info = await getParticipantInfo({
      data: { participantToken: token }
    });

    // Redirect based on state
    if (info.hasDrawn) {
      throw redirect({
        to: "/p/$eventSlug/result",
        params,
        search: { token }
      });
    }
    if (info.isLocked) {
      throw redirect({
        to: "/p/$eventSlug/draw",
        params,
        search: { token }
      });
    }

    return info;
  },
  component: InterestsPage
});

const MIN_INTEREST_LENGTH = 3;

function InterestsPage() {
  const router = useRouter();
  const loaderData = Route.useLoaderData();
  const search = Route.useSearch();
  const token = search.token;

  // Post-submit UI state
  const [isSkipping, setIsSkipping] = useState(false);
  const [interestsStatus, setInterestsStatus] = useState(loaderData.interestsStatus);

  const form = useForm({
    defaultValues: {
      interests: loaderData.myInterests as string[],
      newItem: ""
    },
    onSubmit: async ({ value }) => {
      const result = await updateInterests({
        data: { participantToken: token, interests: value.interests }
      });
      form.setFieldValue("interests", result.interests);
      setInterestsStatus("submitted");
      router.invalidate();
    }
  });

  const lockDateFormatted = loaderData.lockDate
    ? new Date(loaderData.lockDate).toLocaleDateString("de-DE", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : null;

  const handleSkipInterests = async () => {
    setIsSkipping(true);
    try {
      await skipInterests({
        data: { participantToken: token }
      });
      setInterestsStatus("skipped");
      router.invalidate();
    } catch {
      // Error handling via form errors
    } finally {
      setIsSkipping(false);
    }
  };

  const addInterest = () => {
    const newItem = form.getFieldValue("newItem").trim();
    const interests = form.getFieldValue("interests");

    if (!newItem || newItem.length < MIN_INTEREST_LENGTH) return;
    if (interests.includes(newItem)) return;

    form.setFieldValue("interests", [...interests, newItem]);
    form.setFieldValue("newItem", "");
  };

  const removeInterest = async (index: number) => {
    const interests = form.getFieldValue("interests");
    const itemToDelete = interests[index];

    // Update UI immediately for responsiveness
    form.setFieldValue(
      "interests",
      interests.filter((_, i) => i !== index)
    );

    // Persist deletion to database
    await deleteInterest({
      data: { participantToken: token, item: itemToDelete }
    });
  };

  const handleSaveWithPendingInput = () => {
    const newItem = form.getFieldValue("newItem").trim();
    const interests = form.getFieldValue("interests");

    // Add pending input if valid
    if (
      newItem &&
      newItem.length >= MIN_INTEREST_LENGTH &&
      !interests.includes(newItem)
    ) {
      form.setFieldValue("interests", [...interests, newItem]);
      form.setFieldValue("newItem", "");
    }

    form.handleSubmit();
  };

  // If already skipped, show confirmation
  if (interestsStatus === "skipped") {
    return (
      <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
        <h1 className="text-4xl sm:text-5xl font-black text-center">
          Hallo {loaderData.participantName}!
        </h1>

        {/* Step indicator */}
        <div className="w-full flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-success border-2 border-black flex items-center justify-center font-bold text-sm">
              ✓
            </span>
            <span className="font-semibold">Interessen</span>
          </div>
          <div className="flex-1 h-0.5 bg-border" />
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-muted border-2 border-black flex items-center justify-center font-bold text-sm text-muted-foreground">
              2
            </span>
            <span className="text-muted-foreground">Namen ziehen</span>
          </div>
        </div>

        <Alert variant="info" className="w-full">
          <AlertTitle>Schritt 1 erledigt!</AlertTitle>
          <AlertDescription>
            Du hast keine Interessen eingetragen – kein Problem!
            {lockDateFormatted && (
              <span className="block mt-2">
                <span className="font-semibold">Nächster Schritt:</span> Ab{" "}
                {lockDateFormatted} kannst du hier zurückkommen und einen Namen
                ziehen.
              </span>
            )}
          </AlertDescription>
        </Alert>

        <p className="text-xs text-muted-foreground text-center">
          Speichere diesen Link – du brauchst ihn für Schritt 2.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl sm:text-5xl font-black text-center">
        Hallo {loaderData.participantName}!
      </h1>

      <p className="text-xl font-semibold text-center">
        Du wurdest zum Wichteln eingeladen!
      </p>

      {/* Step indicator */}
      <div className="w-full flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary border-2 border-black flex items-center justify-center font-bold text-sm">
            1
          </span>
          <span className="font-semibold">Interessen</span>
        </div>
        <div className="flex-1 h-0.5 bg-border" />
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-muted border-2 border-black flex items-center justify-center font-bold text-sm text-muted-foreground">
            2
          </span>
          <span className="text-muted-foreground">Namen ziehen</span>
        </div>
      </div>

      {/* Explanation */}
      <Card variant="primary" className="p-8">
        <Card.Header>
          <Card.Title>So funktioniert&apos;s</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6">
          <div>
            <h3 className="font-semibold">Jetzt</h3>
            <p>
              Trage deine Interessen ein, damit dein Wichtel weiß, was dir gefällt
            </p>
          </div>
          <div>
            <h3 className="font-semibold">
              {lockDateFormatted ? `Ab ${lockDateFormatted}` : "Nach dem Stichtag"}
            </h3>
            <p>
              Komm zurück und ziehe einen Namen – das ist die Person, die du
              beschenkst
            </p>
          </div>
          <Alert className="text-sm font-bold">
            Falls alle ihre Interessen eingetragen haben kann der Organisator auch
            die nächste Phase starten.
          </Alert>
        </Card.Content>
      </Card>

      <Card className="p-6 w-full">
        <div className="flex flex-col gap-4">
          <h3 className="text-xl font-semibold">Deine Interessen</h3>
          <p>
            Was interessiert dich? Was wünschst du dir?
            <br />
            Die Person, die dich zieht, kann diese Hinweise später sehen.
          </p>
          <p className="mb-4 text-pink-500">
            Wenn du lieber keine Interessen angeben und dich überraschen lassen
            möchtest, kannst du unten einfach auf "Keine Interessen" klicken.
          </p>

          <form.Field name="interests" mode="array">
            {field =>
              field.state.value.length > 0 && (
                <ul className="flex flex-col gap-2">
                  {field.state.value.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="flex-1 bg-muted/30 px-3 py-2 rounded-lg border-2 border-border">
                        {item}
                      </span>
                      <form.Subscribe selector={state => state.isSubmitting}>
                        {isSubmitting => (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeInterest(idx)}
                            disabled={isSubmitting || isSkipping}
                            className="text-red-600 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        )}
                      </form.Subscribe>
                    </li>
                  ))}
                </ul>
              )
            }
          </form.Field>

          <form.Field
            name="newItem"
            validators={{
              onBlur: ({ value }) => {
                // Only validate if there's content - empty is allowed
                if (value.trim() && value.trim().length < MIN_INTEREST_LENGTH) {
                  return `Mindestens ${MIN_INTEREST_LENGTH} Zeichen erforderlich`;
                }
              },
              onChangeListenTo: ["interests"],
              onChange: ({ value }) => {
                const interests = form.getFieldValue("interests");

                if (interests.includes(value.trim())) {
                  return "Dieses Interesse existiert bereits";
                }
                return undefined;
              }
            }}
          >
            {field => (
              <div className="flex flex-col gap-2 mb-4">
                <form.Subscribe
                  selector={state => ({
                    isSubmitting: state.isSubmitting
                  })}
                >
                  {({ isSubmitting }) => (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Neues Interesse..."
                        className="flex-1"
                        variant="info"
                        disabled={isSubmitting || isSkipping}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addInterest}
                        disabled={
                          !field.state.value.trim() ||
                          field.state.meta.errors.length > 0 ||
                          isSubmitting ||
                          isSkipping
                        }
                      >
                        +
                      </Button>
                    </div>
                  )}
                </form.Subscribe>
                {field.state.meta.errors.length > 0 && field.state.value.trim() && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={state => ({
              isSubmitting: state.isSubmitting,
              isSubmitSuccessful: state.isSubmitSuccessful,
              errors: state.errors,
              shouldSaveButtonBeDisabled:
                state.submissionAttempts > 0 &&
                state.fieldMeta.newItem?.isDefaultValue,
              fieldHasErrors: (state.fieldMeta.newItem?.errors ?? []).length > 0
            })}
          >
            {({
              isSubmitting,
              isSubmitSuccessful,
              errors,
              shouldSaveButtonBeDisabled,
              fieldHasErrors
            }) => (
              <>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleSkipInterests}
                    disabled={isSubmitting || isSkipping}
                    variant="outline"
                    className="flex-1"
                  >
                    {isSkipping ? "..." : "Ich will überrascht werden"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveWithPendingInput}
                    disabled={
                      fieldHasErrors ||
                      shouldSaveButtonBeDisabled ||
                      isSubmitting ||
                      isSkipping
                    }
                    variant="success"
                    className="flex-1"
                  >
                    {isSubmitting ? "Speichern..." : "Interessen speichern"}
                  </Button>
                </div>

                {isSubmitSuccessful && (
                  <p className="text-sm text-success text-center font-medium">
                    Gespeichert
                  </p>
                )}

                {errors.length > 0 && (
                  <Alert variant="danger">
                    <AlertTitle>Fehler</AlertTitle>
                    <AlertDescription>{errors.join(", ")}</AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </form.Subscribe>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Das Ausfüllen ist optional. Dieser Link bleibt gültig – du kannst jederzeit
        zurückkommen und deine Interessen bis zum Stichtag bearbeiten.
      </p>
    </div>
  );
}
