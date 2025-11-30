import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient, requireAuth } from "../utils/supabase";
import { generateToken, generateSlug } from "../utils/wichtel";
import type {
  CreateEventInput,
  CreateEventOutput,
  Event,
  Participant
} from "../types/database";

export const createEvent = createServerFn({ method: "POST" })
  .inputValidator((data: CreateEventInput) => data)
  .handler(async ({ data }): Promise<CreateEventOutput> => {
    const supabase = getSupabaseServerClient();
    const user = await requireAuth(supabase);

    const { eventName, eventDate, lockDate, participantNames } = data;

    if (!eventName || eventName.trim().length === 0) {
      throw new Error("Event name is required");
    }

    if (!eventDate) {
      throw new Error("Event date is required");
    }

    if (!lockDate) {
      throw new Error("Lock date is required");
    }

    // Validate lockDate is before or equal to eventDate
    if (new Date(lockDate) > new Date(eventDate)) {
      throw new Error("Lock date must be before or on the event date");
    }

    if (!participantNames || participantNames.length < 3) {
      throw new Error("At least 3 participants are required");
    }

    const uniqueNames = new Set(participantNames.map((name: string) => name.trim()));
    if (uniqueNames.size !== participantNames.length) {
      throw new Error("Participant names must be unique");
    }

    const eventSlug = generateSlug(eventName);
    const adminToken = generateToken();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name: eventName.trim(),
        slug: eventSlug,
        admin_token: adminToken,
        admin_user_id: user.id,
        event_date: eventDate,
        lock_date: lockDate
      })
      .select()
      .single<Event>();

    if (eventError || !event) {
      throw new Error(`Failed to create event: ${eventError?.message}`);
    }

    const participantsToInsert = participantNames.map((name: string) => ({
      event_id: event.id,
      name: name.trim(),
      token: generateToken()
    }));

    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .insert(participantsToInsert)
      .select<"*", Participant>();

    if (participantsError || !participants) {
      await supabase.from("events").delete().eq("id", event.id);
      throw new Error(
        `Failed to create participants: ${participantsError?.message}`
      );
    }

    // Return links without origin - client will use window.location.origin
    return {
      eventSlug,
      adminToken,
      participants: participants.map((participant: Participant) => ({
        name: participant.name,
        token: participant.token,
        link: `/p/${eventSlug}?token=${participant.token}`
      }))
    };
  });
