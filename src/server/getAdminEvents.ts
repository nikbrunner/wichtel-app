import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import type { EventWithStats } from "../types/database";

export const getAdminEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<EventWithStats[]> => {
    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Query events with participants in a single query (avoids N+1)
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        slug,
        admin_token,
        admin_user_id,
        event_date,
        created_at,
        participants (id, name, token, has_drawn, drawn_at)
      `
      )
      .eq("admin_user_id", user.id)
      .order("event_date", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    if (!events) {
      return [];
    }

    // Calculate stats from the fetched data
    const eventsWithStats: EventWithStats[] = events.map(event => {
      const participants = (event.participants || []).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      const participantCount = participants.length;
      const drawnCount = participants.filter(p => p.has_drawn).length;
      const notDrawnCount = participantCount - drawnCount;

      // Calculate days until event
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: event.id,
        name: event.name,
        slug: event.slug,
        admin_token: event.admin_token,
        admin_user_id: event.admin_user_id,
        event_date: event.event_date,
        created_at: event.created_at,
        participant_count: participantCount,
        drawn_count: drawnCount,
        not_drawn_count: notDrawnCount,
        days_until_event: diffDays >= 0 ? diffDays : null,
        is_past: diffDays < 0,
        participants
      };
    });

    return eventsWithStats;
  }
);
