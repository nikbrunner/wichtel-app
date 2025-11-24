import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, getCurrentUser } from "../utils/supabase";
import type { EventDetailsOutput, Event, Participant } from "../types/database";

export const getEventDetails = createServerFn({ method: "GET" })
  .inputValidator((data: { eventSlug: string; adminToken?: string }) => data)
  .handler(async ({ data }): Promise<EventDetailsOutput> => {
    const { eventSlug, adminToken } = data;

    if (!eventSlug) {
      throw new Error("Event slug is required");
    }

    const supabase = getSupabaseServerClient();
    const user = await getCurrentUser(supabase);

    let event: Event | null = null;

    // Try auth-based access first (if user is logged in)
    if (user) {
      const { data: authEvent, error: authError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .eq("admin_user_id", user.id)
        .single<Event>();

      if (authEvent && !authError) {
        event = authEvent;
      }
    }

    // Fall back to token-based access if auth failed and token provided
    if (!event && adminToken) {
      const { data: tokenEvent, error: tokenError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .eq("admin_token", adminToken)
        .single<Event>();

      if (tokenEvent && !tokenError) {
        event = tokenEvent;
      }
    }

    if (!event) {
      throw new Error("Event not found or access denied");
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
