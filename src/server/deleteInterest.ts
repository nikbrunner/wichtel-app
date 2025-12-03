import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type { Participant, Event } from "../types/database";

type ParticipantWithEvent = Pick<Participant, "id"> & {
  event: Pick<Event, "lock_date"> | null;
};

type DeleteInterestInput = {
  participantToken: string;
  item: string;
};

export const deleteInterest = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteInterestInput) => data)
  .handler(async ({ data }) => {
    const { participantToken, item } = data;

    if (!participantToken) {
      throw new Error("Participant token is required");
    }

    const supabase = getSupabaseServiceRoleClient();

    // Get participant with event lock_date
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select(
        `
        id,
        event:events(lock_date)
      `
      )
      .eq("token", participantToken)
      .single<ParticipantWithEvent>();

    if (participantError || !participant) {
      throw new Error("Invalid participant token");
    }

    // Check if lock date has passed
    const lockDate = participant.event?.lock_date;
    if (lockDate && new Date() >= new Date(lockDate)) {
      throw new Error(
        "Der Stichtag ist bereits vorbei. Interessen können nicht mehr geändert werden."
      );
    }

    // Delete the specific interest
    const { error: deleteError } = await supabase
      .from("participant_interests")
      .delete()
      .eq("participant_id", participant.id)
      .eq("item", item);

    if (deleteError) {
      throw new Error(`Fehler beim Löschen: ${deleteError.message}`);
    }

    return { success: true };
  });
