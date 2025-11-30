import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServiceRoleClient } from "../utils/supabase";
import type {
  DrawNameInput,
  DrawNameOutput,
  Participant,
  Draw,
  Event
} from "../types/database";

type ParticipantWithEvent = Participant & {
  event: Pick<Event, "lock_date"> | null;
};

export const drawName = createServerFn({ method: "POST" })
  .inputValidator((data: DrawNameInput) => data)
  .handler(async ({ data }): Promise<DrawNameOutput> => {
    const { participantToken } = data;

    if (!participantToken) {
      throw new Error("Participant token is required");
    }

    const supabase = getSupabaseServiceRoleClient();

    // Get the participant by token with event lock_date
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

    // Check if lock date has passed (only allow draw after lock date)
    const lockDate = participant.event?.lock_date;
    if (lockDate && new Date() < new Date(lockDate)) {
      throw new Error("Das Ziehen ist erst nach dem Stichtag möglich");
    }

    // Check if participant has already drawn
    if (participant.has_drawn) {
      // Return existing draw
      const { data: existingDraw } = await supabase
        .from("draws")
        .select("drawn_id")
        .eq("drawer_id", participant.id)
        .single<Draw>();

      if (existingDraw) {
        const { data: drawnParticipant } = await supabase
          .from("participants")
          .select("name")
          .eq("id", existingDraw.drawn_id)
          .single<Participant>();

        if (drawnParticipant) {
          return { drawnName: drawnParticipant.name };
        }
      }
    }

    // Get all participants for this event
    const { data: allParticipants, error: allParticipantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", participant.event_id);

    if (allParticipantsError || !allParticipants) {
      throw new Error("Failed to fetch event participants");
    }

    // Get all existing draws for this event
    const { data: existingDraws } = await supabase
      .from("draws")
      .select("drawn_id")
      .eq("event_id", participant.event_id);

    const alreadyDrawnIds = new Set(
      (existingDraws || []).map((draw: { drawn_id: string }) => draw.drawn_id)
    );

    // Filter available participants: exclude self and already drawn
    const availableParticipants = allParticipants.filter(
      (p: Participant) => p.id !== participant.id && !alreadyDrawnIds.has(p.id)
    );

    if (availableParticipants.length === 0) {
      throw new Error("No one left to draw");
    }

    // Randomly select one available participant
    const randomIndex = Math.floor(Math.random() * availableParticipants.length);
    const drawnParticipant = availableParticipants[randomIndex];

    // Create the draw record
    const { error: drawError } = await supabase.from("draws").insert({
      event_id: participant.event_id,
      drawer_id: participant.id,
      drawn_id: drawnParticipant.id
    });

    if (drawError) {
      throw new Error(`Failed to create draw: ${drawError.message}`);
    }

    // Update participant's has_drawn status
    const { error: updateError } = await supabase
      .from("participants")
      .update({
        has_drawn: true,
        drawn_at: new Date().toISOString()
      })
      .eq("id", participant.id);

    if (updateError) {
      throw new Error(`Failed to update participant: ${updateError.message}`);
    }

    return { drawnName: drawnParticipant.name };
  });
