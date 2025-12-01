import { Alert, AlertTitle, AlertDescription } from "@/components/retroui/Alert";
import { Card } from "@/components/retroui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/retroui/Table";

import type { DrawResult } from "../types/database";
import dayjs from "dayjs";

type DrawResultsSectionProps = {
  eventDate: string;
  isPast: boolean;
  drawResults: DrawResult[] | null;
};

export function DrawResultsSection({
  eventDate,
  isPast,
  drawResults
}: DrawResultsSectionProps) {
  // If event date hasn't passed, show lock message
  if (!isPast) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Ziehungsergebnisse</h3>
        <Alert variant="info">
          <AlertTitle>Noch nicht verfügbar</AlertTitle>
          <AlertDescription>
            Die Ziehungsergebnisse werden erst nach dem Event-Datum (
            {dayjs(eventDate).format("DD.MM.YYYY")}) sichtbar, um die Überraschung zu
            bewahren.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // If past but no results yet
  if (!drawResults || drawResults.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-semibold">Ziehungsergebnisse</h3>
        <Card className="p-4">
          <p className="text-muted-foreground text-center">
            Noch niemand hat gezogen.
          </p>
        </Card>
      </div>
    );
  }

  // Show results
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">Ziehungsergebnisse</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Wer zieht</TableHead>
            <TableHead>Hat gezogen</TableHead>
            <TableHead>Wann</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drawResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell className="font-semibold">{result.drawer_name}</TableCell>
              <TableCell>{result.drawn_name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {dayjs(result.created_at).format("DD.MM.YYYY HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
