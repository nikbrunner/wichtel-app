import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type {
  SkipInterestsInput,
  SkipInterestsOutput,
  Participant,
  Event
} from "../types/database";

type ParticipantWithEvent = Pick<Participant, "id"> & {
  event: Pick<Event, "lock_date"> | null;
};

export const skipInterests = createServerFn({ method: "POST" })
  .inputValidator((data: SkipInterestsInput) => data)
  .handler(async ({ data }): Promise<SkipInterestsOutput> => {
    const { participantToken } = data;

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

    // Check if lock date has passed (can't modify after lock)
    const lockDate = participant.event?.lock_date;
    if (lockDate && new Date() >= new Date(lockDate)) {
      throw new Error(
        "Der Stichtag ist bereits vorbei. Der Status kann nicht mehr geändert werden."
      );
    }

    // Update interests_status to 'skipped'
    const { error: updateError } = await supabase
      .from("participants")
      .update({ interests_status: "skipped" })
      .eq("id", participant.id);

    if (updateError) {
      throw new Error(`Fehler beim Aktualisieren: ${updateError.message}`);
    }

    return { success: true };
  });
