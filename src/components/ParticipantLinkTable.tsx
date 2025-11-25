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

type ParticipantLinkTableProps = {
  eventSlug: string;
  participants: Array<{
    id: string;
    name: string;
    token: string;
    has_drawn: boolean;
    drawn_at: string | null;
  }>;
  onRegenerateLink: (participantId: string, participantName: string) => void;
  regeneratingId: string | null;
};

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
  regeneratingId
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
                  {participant.has_drawn ? (
                    <Badge variant="solid" className="bg-green-500 text-white">
                      Gezogen
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-muted">
                      Noch nicht
                    </Badge>
                  )}
                </div>

                <Input readOnly value={link} className="text-xs" />

                <div className="flex gap-2">
                  <Button
                    onClick={() => copy(link, participant.id)}
                    variant={isCopied ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    {isCopied ? "Kopiert" : "Kopieren"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onRegenerateLink(participant.id, participant.name)
                    }
                    disabled={regeneratingId !== null}
                    className="flex-1"
                  >
                    {regeneratingId === participant.id ? "..." : "Regenerieren"}
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
              <TableHead>Status</TableHead>
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
                    {participant.has_drawn ? (
                      <Badge variant="solid" className="bg-green-500 text-white">
                        Gezogen
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-muted">
                        Noch nicht
                      </Badge>
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
                        variant={isCopied ? "default" : "outline"}
                        size="sm"
                      >
                        {isCopied ? "Kopiert" : "Kopieren"}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onRegenerateLink(participant.id, participant.name)
                      }
                      disabled={regeneratingId !== null}
                    >
                      {regeneratingId === participant.id ? "..." : "Regenerieren"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
