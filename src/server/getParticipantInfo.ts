import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type {
  ParticipantInfoOutput,
  Participant,
  Draw,
  Event
} from "../types/database";

type ParticipantWithEvent = Participant & {
  event: Pick<Event, "lock_date"> | null;
};

export const getParticipantInfo = createServerFn({ method: "GET" })
  .inputValidator((data: { participantToken: string }) => data)
  .handler(async ({ data }): Promise<ParticipantInfoOutput> => {
    const { participantToken } = data;

    if (!participantToken) {
      throw new Error("Participant token is required");
    }

    const supabase = getSupabaseServiceRoleClient();

    // Get the participant by token with event info (including lock_date)
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select(
        `
        *,
        event:events(lock_date)
      `
      )
      .eq("token", participantToken)
      .single<ParticipantWithEvent>();

    if (participantError || !participant) {
      throw new Error("Invalid participant token");
    }

    const lockDate = participant.event?.lock_date ?? null;
    // If no lock_date, default to locked (backwards compatibility - can draw immediately)
    const isLocked = lockDate ? new Date() >= new Date(lockDate) : true;

    // Get this participant's interests
    const { data: myInterestsData } = await supabase
      .from("participant_interests")
      .select("item")
      .eq("participant_id", participant.id)
      .order("created_at");

    const myInterests = (myInterestsData || []).map(i => i.item);

    let drawnName: string | null = null;
    let drawnPersonInterests: string[] | null = null;

    // If participant has drawn, get the drawn name and their interests
    if (participant.has_drawn) {
      const { data: draw } = await supabase
        .from("draws")
        .select("drawn_id")
        .eq("drawer_id", participant.id)
        .single<Draw>();

      if (draw) {
        const { data: drawnParticipant } = await supabase
          .from("participants")
          .select("id, name")
          .eq("id", draw.drawn_id)
          .single<Pick<Participant, "id" | "name">>();

        if (drawnParticipant) {
          drawnName = drawnParticipant.name;

          // Get drawn person's interests
          const { data: interestsData } = await supabase
            .from("participant_interests")
            .select("item")
            .eq("participant_id", drawnParticipant.id)
            .order("created_at");

          drawnPersonInterests = (interestsData || []).map(i => i.item);
        }
      }
    }

    return {
      participantName: participant.name,
      hasDrawn: participant.has_drawn,
      drawnName,
      drawnPersonInterests,
      isLocked,
      lockDate,
      myInterests,
      interestsStatus: participant.interests_status
    };
  });
