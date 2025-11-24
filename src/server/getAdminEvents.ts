import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import type { EventWithStats } from "../types/database";

export const getAdminEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<EventWithStats[]> => {
    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Query events with participant stats
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
        created_at
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

    // Fetch participant counts and draw stats for each event
    const eventsWithStats: EventWithStats[] = await Promise.all(
      events.map(async event => {
        const { data: participants } = await supabase
          .from("participants")
          .select("id, has_drawn")
          .eq("event_id", event.id);

        const participantCount = participants?.length || 0;
        const drawnCount = participants?.filter(p => p.has_drawn).length || 0;
        const notDrawnCount = participantCount - drawnCount;

        // Calculate days until event
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);
        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...event,
          participant_count: participantCount,
          drawn_count: drawnCount,
          not_drawn_count: notDrawnCount,
          days_until_event: diffDays >= 0 ? diffDays : null,
          is_past: diffDays < 0
        };
      })
    );

    return eventsWithStats;
  }
);
