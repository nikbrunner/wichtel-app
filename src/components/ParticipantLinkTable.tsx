import { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import { Card } from "@/components/retroui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/retroui/Table";

import type { InterestsStatus } from "../types/database";

type ParticipantLinkTableProps = {
  eventSlug: string;
  participants: Array<{
    id: string;
    name: string;
    token: string;
    has_drawn: boolean;
    drawn_at: string | null;
    interests_status: InterestsStatus;
  }>;
  onRegenerateLink: (participantId: string, participantName: string) => void;
  regeneratingId: string | null;
  onDeleteParticipant: (participantId: string, participantName: string) => void;
  deletingId: string | null;
  canAddParticipants: boolean;
  onAddParticipant: () => void;
};

function InterestsStatusBadge({ status }: { status: InterestsStatus }) {
  switch (status) {
    case "submitted":
      return (
        <Badge variant="success" title="Hat Wünsche eingetragen">
          Wünsche
        </Badge>
      );
    case "skipped":
      return (
        <Badge variant="warning" title="Hat keine Wünsche eingetragen">
          Übersprungen
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge variant="default" title="Hat noch nicht reagiert">
          Ausstehend
        </Badge>
      );
  }
}

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

export function ParticipantLinkTable({
  eventSlug,
  participants,
  onRegenerateLink,
  regeneratingId,
  onDeleteParticipant,
  deletingId,
  canAddParticipants,
  onAddParticipant
}: ParticipantLinkTableProps) {
  const { copiedId, copy } = useCopyToClipboard();

  const generateLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/e/${eventSlug}?token=${token}`;
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="flex flex-col gap-3 sm:hidden">
        {participants.map(participant => {
          const link = generateLink(participant.token);
          const isCopied = copiedId === participant.id;
          return (
            <Card key={participant.id} className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{participant.name}</span>
                  <div className="flex gap-1">
                    <InterestsStatusBadge status={participant.interests_status} />
                    {participant.has_drawn ? (
                      <Badge variant="success">Gezogen</Badge>
                    ) : (
                      <Badge variant="default">Noch nicht</Badge>
                    )}
                  </div>
                </div>

                <Input readOnly value={link} className="text-xs" />

                <div className="flex gap-2">
                  <Button
                    onClick={() => copy(link, participant.id)}
                    variant={isCopied ? "success" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {isCopied ? "Kopiert!" : "Kopieren"}
                  </Button>
                  <Button
                    size="sm"
                    variant="pink"
                    onClick={() =>
                      onRegenerateLink(participant.id, participant.name)
                    }
                    disabled={regeneratingId !== null || deletingId !== null}
                    className="flex-1"
                  >
                    {regeneratingId === participant.id ? "..." : "Regenerieren"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      onDeleteParticipant(participant.id, participant.name)
                    }
                    disabled={regeneratingId !== null || deletingId !== null}
                  >
                    {deletingId === participant.id ? "..." : "×"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teilnehmer</TableHead>
              <TableHead>Wünsche</TableHead>
              <TableHead>Ziehung</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map(participant => {
              const link = generateLink(participant.token);
              const isCopied = copiedId === participant.id;
              return (
                <TableRow key={participant.id}>
                  <TableCell className="font-semibold">{participant.name}</TableCell>
                  <TableCell>
                    <InterestsStatusBadge status={participant.interests_status} />
                  </TableCell>
                  <TableCell>
                    {participant.has_drawn ? (
                      <Badge variant="success">Gezogen</Badge>
                    ) : (
                      <Badge variant="default">Noch nicht</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Input
                        readOnly
                        value={link}
                        className="flex-1 min-w-[200px] text-xs"
                      />
                      <Button
                        onClick={() => copy(link, participant.id)}
                        variant={isCopied ? "success" : "outline"}
                        size="sm"
                      >
                        {isCopied ? "Kopiert!" : "Kopieren"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="pink"
                        onClick={() =>
                          onRegenerateLink(participant.id, participant.name)
                        }
                        disabled={regeneratingId !== null || deletingId !== null}
                      >
                        {regeneratingId === participant.id ? "..." : "Regenerieren"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          onDeleteParticipant(participant.id, participant.name)
                        }
                        disabled={regeneratingId !== null || deletingId !== null}
                      >
                        {deletingId === participant.id ? "..." : "Löschen"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add Participant Button or Info */}
      <div className="mt-4">
        {canAddParticipants ? (
          <Button variant="success" onClick={onAddParticipant}>
            + Teilnehmer hinzufügen
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Neue Teilnehmer können nicht mehr hinzugefügt werden, da bereits
            Ziehungen stattgefunden haben.
          </p>
        )}
      </div>
    </>
  );
}
