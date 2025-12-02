/**
 * Database entity types matching the Supabase schema
 */

export type Event = {
  id: string;
  name: string;
  slug: string;
  admin_token: string | null;
  admin_user_id: string | null;
  event_date: string; // ISO date string
  lock_date: string | null; // ISO date string, nullable for backwards compat
  created_at: string;
};

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
};

export type DrawResult = {
  drawer_name: string;
  drawn_name: string;
  created_at: string;
};

export type InterestsStatus = "pending" | "skipped" | "submitted";

export type EventWithStats = Event & {
  participant_count: number;
  drawn_count: number;
  not_drawn_count: number;
  days_until_event: number | null;
  is_past: boolean;
  participants: Array<{
    id: string;
    name: string;
    token: string;
    has_drawn: boolean;
    drawn_at: string | null;
    interests_status: InterestsStatus;
  }>;
  draw_results: DrawResult[] | null;
};

export type Participant = {
  id: string;
  event_id: string;
  name: string;
  token: string;
  has_drawn: boolean;
  drawn_at: string | null;
  interests_status: InterestsStatus;
};

export type ParticipantInterest = {
  id: string;
  participant_id: string;
  item: string;
  created_at: string;
};

export type Draw = {
  id: string;
  event_id: string;
  drawer_id: string;
  drawn_id: string;
  created_at: string;
};

/**
 * Input/Output types for server functions
 */

export type CreateEventInput = {
  eventName: string;
  eventDate: string; // YYYY-MM-DD format
  lockDate: string; // YYYY-MM-DD format
  participantNames: string[];
};

export type CreateEventOutput = {
  eventSlug: string;
  adminToken: string;
  participants: Array<{
    name: string;
    token: string;
    link: string;
  }>;
};

export type DrawNameInput = {
  participantToken: string;
};

export type DrawNameOutput = {
  drawnName: string;
};

export type EventDetailsOutput = {
  eventName: string;
  participants: Array<{
    id: string;
    name: string;
    hasDrawn: boolean;
    drawnAt: string | null;
  }>;
};

export type ParticipantInfoOutput = {
  participantName: string;
  hasDrawn: boolean;
  drawnName: string | null;
  drawnPersonInterests: string[] | null;
  isLocked: boolean;
  lockDate: string | null;
  myInterests: string[];
  interestsStatus: InterestsStatus;
};

// Interests management
export type UpdateInterestsInput = {
  participantToken: string;
  interests: string[];
};

export type UpdateInterestsOutput = {
  interests: string[];
};

export type SkipInterestsInput = {
  participantToken: string;
};

export type SkipInterestsOutput = {
  success: boolean;
};

export type RegenerateParticipantLinkInput = {
  eventSlug: string;
  participantId: string;
};

export type RegenerateParticipantLinkOutput = {
  newToken: string;
  newLink: string;
};

// Delete Event
export type DeleteEventInput = {
  eventId: string;
};

export type DeleteEventOutput = {
  success: boolean;
};

// Delete Participant
export type DeleteParticipantInput = {
  eventId: string;
  participantId: string;
};

export type DeleteParticipantOutput = {
  success: boolean;
  resetParticipantIds: string[];
};

// Add Participant
export type AddParticipantInput = {
  eventId: string;
  participantName: string;
};

export type AddParticipantOutput = {
  participant: {
    id: string;
    name: string;
    token: string;
    link: string;
  };
};

// Lock Event (transition to draw phase)
export type LockEventInput = {
  eventId: string;
};

export type LockEventOutput = {
  success: boolean;
  lockDate: string;
};
