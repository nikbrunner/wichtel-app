import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import type { LockEventInput, LockEventOutput, Event } from "../types/database";

export const lockEvent = createServerFn({ method: "POST" })
  .inputValidator((data: LockEventInput) => data)
  .handler(async ({ data }): Promise<LockEventOutput> => {
    const { eventId } = data;

    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    // Verify user owns this event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, lock_date")
      .eq("id", eventId)
      .eq("admin_user_id", user.id)
      .single<Pick<Event, "id" | "lock_date">>();

    if (eventError || !event) {
      throw new Error("Event not found or access denied");
    }

    // Set lock_date to now (making drawing immediately available)
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const { error: updateError } = await supabase
      .from("events")
      .update({ lock_date: now })
      .eq("id", eventId);

    if (updateError) {
      throw new Error(`Failed to lock event: ${updateError.message}`);
    }

    return { success: true, lockDate: now };
  });
