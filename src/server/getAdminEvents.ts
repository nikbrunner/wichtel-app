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
        lock_date,
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
          .select("id, name, token, has_drawn, drawn_at, interests_status")
          .eq("event_id", event.id)
          .order("name");

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
        const isPast = diffDays < 0;

        // Fetch draw results only if event date has passed
        let drawResults = null;
        if (isPast) {
          const { data: draws } = await supabase
            .from("draws")
            .select(
              `
              created_at,
              drawer:participants!draws_drawer_id_fkey(name),
              drawn:participants!draws_drawn_id_fkey(name)
            `
            )
            .eq("event_id", event.id)
            .order("created_at");

          if (draws && draws.length > 0) {
            drawResults = draws.map(draw => {
              // Supabase returns joined relations - access first element if array
              const drawerData = Array.isArray(draw.drawer)
                ? draw.drawer[0]
                : draw.drawer;
              const drawnData = Array.isArray(draw.drawn)
                ? draw.drawn[0]
                : draw.drawn;

              return {
                drawer_name: (drawerData as { name: string }).name,
                drawn_name: (drawnData as { name: string }).name,
                created_at: draw.created_at
              };
            });
          }
        }

        return {
          ...event,
          participant_count: participantCount,
          drawn_count: drawnCount,
          not_drawn_count: notDrawnCount,
          days_until_event: diffDays >= 0 ? diffDays : null,
          is_past: isPast,
          participants: participants || [],
          draw_results: drawResults
        };
      })
    );

    return eventsWithStats;
  }
);
