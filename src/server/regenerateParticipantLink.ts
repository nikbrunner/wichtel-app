import { createServerFn, getWebRequest } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";
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
    const { eventSlug, adminToken, participantId } = data;

    if (!eventSlug || !adminToken || !participantId) {
      throw new Error("Event slug, admin token, and participant ID are required");
    }

    const supabase = getSupabaseServerClient();

    // Verify admin token and get event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("slug", eventSlug)
      .eq("admin_token", adminToken)
      .single<Event>();

    if (eventError || !event) {
      throw new Error("Invalid event or admin token");
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

    const request = getWebRequest();
    const origin = new URL(request.url).origin;

    return {
      newToken,
      newLink: `${origin}/e/${eventSlug}?token=${newToken}`
    };
  });
