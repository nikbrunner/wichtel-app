import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";
import type { EventDetailsOutput, Event, Participant } from "../types/database";

export const getEventDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { eventSlug: string; adminToken: string }) => data)
  .handler(async ({ data }): Promise<EventDetailsOutput> => {
    const { eventSlug, adminToken } = data;

    if (!eventSlug || !adminToken) {
      throw new Error("Event slug and admin token are required");
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

    // Get all participants for this event
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("event_id", event.id)
      .order("name");

    if (participantsError || !participants) {
      throw new Error("Failed to fetch participants");
    }

    return {
      eventName: event.name,
      participants: participants.map((participant: Participant) => ({
        id: participant.id,
        name: participant.name,
        hasDrawn: participant.has_drawn,
        drawnAt: participant.drawn_at
      }))
    };
  });
