import { createServerFn, getWebRequest } from "@tanstack/react-start";
import { getSupabaseServerClient } from "../utils/supabase";
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
    const { eventName, participantNames } = data;

    if (!eventName || eventName.trim().length === 0) {
      throw new Error("Event name is required");
    }

    if (!participantNames || participantNames.length < 2) {
      throw new Error("At least 2 participants are required");
    }

    const uniqueNames = new Set(participantNames.map((name: string) => name.trim()));
    if (uniqueNames.size !== participantNames.length) {
      throw new Error("Participant names must be unique");
    }

    const supabase = getSupabaseServerClient();

    const eventSlug = generateSlug(eventName);
    const adminToken = generateToken();

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        name: eventName.trim(),
        slug: eventSlug,
        admin_token: adminToken
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

    const request = getWebRequest();
    const origin = new URL(request.url).origin;

    return {
      eventSlug,
      adminToken,
      participants: participants.map((participant: Participant) => ({
        name: participant.name,
        token: participant.token,
        link: `${origin}/e/${eventSlug}?token=${participant.token}`
      }))
    };
  });
