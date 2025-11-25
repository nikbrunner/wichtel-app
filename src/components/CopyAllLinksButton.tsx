import { Button } from "@/components/retroui/Button";
import { useState } from "react";

type CopyAllLinksButtonProps = {
  eventName: string;
  eventSlug: string;
  participants: Array<{
    id: string;
    name: string;
    token: string;
  }>;
};

export function CopyAllLinksButton({
  eventName,
  eventSlug,
  participants
}: CopyAllLinksButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    // Format all links as a shareable message
    const message = `Wichtel-Links für "${eventName}":

${participants
  .map(p => {
    const link = `${origin}/e/${eventSlug}?token=${p.token}`;
    return `${p.name}: ${link}`;
  })
  .join("\n\n")}

Viel Spaß beim Wichteln!`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy links:", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? "success" : "secondary"}
      className="w-full"
    >
      {copied ? "Alle Links kopiert!" : "Alle Links kopieren"}
    </Button>
  );
}
