import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import { generateToken } from "../utils/wichtel";
import type {
  AddParticipantInput,
  AddParticipantOutput,
  Event,
  Participant
} from "../types/database";

export const addParticipant = createServerFn({ method: "POST" })
  .inputValidator((data: AddParticipantInput) => data)
  .handler(async ({ data }): Promise<AddParticipantOutput> => {
    const { eventId, participantName } = data;

    if (!eventId || !participantName?.trim()) {
      throw new Error("Event ID and participant name are required");
    }

    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Verify user owns this event and get slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, slug")
      .eq("id", eventId)
      .eq("admin_user_id", user.id)
      .single<Pick<Event, "id" | "slug">>();

    if (eventError || !event) {
      throw new Error("Event not found or access denied");
    }

    // Check if ANY draws have been made for this event
    const { count: drawCount } = await supabase
      .from("draws")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (drawCount && drawCount > 0) {
      throw new Error(
        "Teilnehmer können nicht mehr hinzugefügt werden, nachdem Ziehungen begonnen haben"
      );
    }

    // Check for duplicate name
    const { data: existingParticipant } = await supabase
      .from("participants")
      .select("id")
      .eq("event_id", eventId)
      .eq("name", participantName.trim())
      .single();

    if (existingParticipant) {
      throw new Error("Ein Teilnehmer mit diesem Namen existiert bereits");
    }

    // Create the new participant
    const newToken = generateToken();
    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert({
        event_id: eventId,
        name: participantName.trim(),
        token: newToken,
        has_drawn: false
      })
      .select()
      .single<Participant>();

    if (insertError || !participant) {
      throw new Error(
        `Failed to add participant: ${insertError?.message ?? "Unknown error"}`
      );
    }

    return {
      participant: {
        id: participant.id,
        name: participant.name,
        token: participant.token,
        link: `/e/${event.slug}?token=${participant.token}`
      }
    };
  });
