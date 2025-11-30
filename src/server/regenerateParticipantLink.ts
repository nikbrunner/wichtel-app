import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import { generateToken } from "../utils/wichtel";
import type {
  RegenerateParticipantLinkInput,
  RegenerateParticipantLinkOutput,
  Event,
  Participant
} from "../types/database";

export const regenerateParticipantLink = createServerFn({ method: "POST" })
  .inputValidator((data: RegenerateParticipantLinkInput) => data)
  .handler(async ({ data }): Promise<RegenerateParticipantLinkOutput> => {
    const { eventSlug, participantId } = data;

    if (!eventSlug || !participantId) {
      throw new Error("Event slug and participant ID are required");
    }

    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Verify user owns this event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", eventSlug)
      .eq("admin_user_id", user.id)
      .single<Event>();

    if (eventError || !event) {
      throw new Error("Event not found or access denied");
    }

    // Verify participant belongs to this event
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("*")
      .eq("id", participantId)
      .eq("event_id", event.id)
      .single<Participant>();

    if (participantError || !participant) {
      throw new Error("Invalid participant ID for this event");
    }

    // Delete any existing draw for this participant
    await supabase.from("draws").delete().eq("drawer_id", participantId);

    // Generate new token and reset participant status
    const newToken = generateToken();

    const { error: updateError } = await supabase
      .from("participants")
      .update({
        token: newToken,
        has_drawn: false,
        drawn_at: null
      })
      .eq("id", participantId);

    if (updateError) {
      throw new Error(`Failed to regenerate link: ${updateError.message}`);
    }

    // Return link without origin - client will prepend it
    return {
      newToken,
      newLink: `/p/${eventSlug}?token=${newToken}`
    };
  });
