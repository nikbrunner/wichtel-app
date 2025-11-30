import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type {
  UpdateInterestsInput,
  UpdateInterestsOutput,
  Participant,
  Event
} from "../types/database";

type ParticipantWithEvent = Pick<Participant, "id"> & {
  event: Pick<Event, "lock_date"> | null;
};

export const updateInterests = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateInterestsInput) => data)
  .handler(async ({ data }): Promise<UpdateInterestsOutput> => {
    const { participantToken, interests } = data;

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
        "Der Stichtag ist bereits vorbei. Interessen können nicht mehr geändert werden."
      );
    }

    // Delete existing interests
    await supabase
      .from("participant_interests")
      .delete()
      .eq("participant_id", participant.id);

    // Filter and trim interests
    const validInterests = interests.map(i => i.trim()).filter(i => i.length > 0);

    // Insert new interests if any
    if (validInterests.length > 0) {
      const { error: insertError } = await supabase
        .from("participant_interests")
        .insert(
          validInterests.map(item => ({
            participant_id: participant.id,
            item
          }))
        );

      if (insertError) {
        throw new Error(`Fehler beim Speichern: ${insertError.message}`);
      }
    }

    // Update interests_status to 'submitted'
    await supabase
      .from("participants")
      .update({ interests_status: "submitted" })
      .eq("id", participant.id);

    return { interests: validInterests };
  });
