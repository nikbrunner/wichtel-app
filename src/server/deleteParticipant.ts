import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import type {
  DeleteParticipantInput,
  DeleteParticipantOutput,
  Event,
  Participant
} from "../types/database";

export const deleteParticipant = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteParticipantInput) => data)
  .handler(async ({ data }): Promise<DeleteParticipantOutput> => {
    const { eventId, participantId } = data;

    if (!eventId || !participantId) {
      throw new Error("Event ID and participant ID are required");
    }

    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Verify user owns this event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", eventId)
      .eq("admin_user_id", user.id)
      .single<Pick<Event, "id">>();

    if (eventError || !event) {
      throw new Error("Event not found or access denied");
    }

    // Verify participant belongs to this event
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id")
      .eq("id", participantId)
      .eq("event_id", eventId)
      .single<Pick<Participant, "id">>();

    if (participantError || !participant) {
      throw new Error("Participant not found");
    }

    // Find participants who drew this participant (they need has_drawn reset)
    const { data: drawersWhoDrawnThis } = await supabase
      .from("draws")
      .select("drawer_id")
      .eq("drawn_id", participantId);

    const drawerIds = (drawersWhoDrawnThis ?? [])
      .map(d => d.drawer_id)
      .filter((id): id is string => id !== null);

    // Reset has_drawn for anyone who drew this participant
    if (drawerIds.length > 0) {
      const { error: resetError } = await supabase
        .from("participants")
        .update({ has_drawn: false, drawn_at: null })
        .in("id", drawerIds);

      if (resetError) {
        throw new Error(`Failed to reset draw status: ${resetError.message}`);
      }
    }

    // Delete the participant (CASCADE will handle draws where this participant is drawer or drawn)
    const { error: deleteError } = await supabase
      .from("participants")
      .delete()
      .eq("id", participantId);

    if (deleteError) {
      throw new Error(`Failed to delete participant: ${deleteError.message}`);
    }

    return {
      success: true,
      resetParticipantIds: drawerIds
    };
  });
