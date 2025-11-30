import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type { ParticipantInfoOutput, Participant, Draw } from "../types/database";

export const getParticipantInfo = createServerFn({ method: "GET" })
  .inputValidator((data: { participantToken: string }) => data)
  .handler(async ({ data }): Promise<ParticipantInfoOutput> => {
    const { participantToken } = data;

    if (!participantToken) {
      throw new Error("Participant token is required");
    }

    const supabase = getSupabaseServiceRoleClient();

    // Get the participant by token
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("*")
      .eq("token", participantToken)
      .single<Participant>();

    if (participantError || !participant) {
      throw new Error("Invalid participant token");
    }

    let drawnName: string | null = null;

    // If participant has drawn, get the drawn name
    if (participant.has_drawn) {
      const { data: draw } = await supabase
        .from("draws")
        .select("drawn_id")
        .eq("drawer_id", participant.id)
        .single<Draw>();

      if (draw) {
        const { data: drawnParticipant } = await supabase
          .from("participants")
          .select("name")
          .eq("id", draw.drawn_id)
          .single<Participant>();

        if (drawnParticipant) {
          drawnName = drawnParticipant.name;
        }
      }
    }

    return {
      participantName: participant.name,
      hasDrawn: participant.has_drawn,
      drawnName
    };
  });
