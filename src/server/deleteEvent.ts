import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import type { DeleteEventInput, DeleteEventOutput, Event } from "../types/database";

export const deleteEvent = createServerFn({ method: "POST" })
  .inputValidator((data: DeleteEventInput) => data)
  .handler(async ({ data }): Promise<DeleteEventOutput> => {
    const { eventId } = data;

    if (!eventId) {
      throw new Error("Event ID is required");
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

    // Delete the event (CASCADE will handle participants and draws)
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      throw new Error(`Failed to delete event: ${deleteError.message}`);
    }

    return { success: true };
  });
