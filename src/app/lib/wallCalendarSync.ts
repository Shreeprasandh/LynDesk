import { supabase } from "./supabase";

export interface WallEvent {
  id: string;
  user_id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: "contest" | "deadline" | "study" | "opportunity" | "reminder";
  description?: string;
  link?: string;
  source_type?: "study_path" | "event_desk" | "opportunity" | "custom";
  source_id?: string;
  isAutoSynced?: boolean;
}

const STORAGE_KEY = "ldk_wall_calendar_events";

function getLocalEvents(userId?: string): WallEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: WallEvent[], userId?: string) {
  if (typeof window === "undefined") return;
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent("ldk_wall_calendar_update"));
  } catch {}
}

/**
 * Fetch all WallCalendar events for a user (combining DB, auto-sync, and localStorage)
 */
export async function fetchWallCalendarEvents(userId?: string): Promise<WallEvent[]> {
  const localEvents = getLocalEvents(userId);
  let dbEvents: WallEvent[] = [];

  if (userId) {
    try {
      const { data, error } = await supabase
        .from("wall_calendar_events")
        .select("*")
        .eq("user_id", userId);

      if (!error && data) {
        dbEvents = data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          title: d.title,
          date: d.event_date,
          time: d.event_time,
          category: d.category,
          description: d.description,
          link: d.link,
          source_type: d.source_type,
          source_id: d.source_id,
        }));
      }
    } catch {}
  }

  // Merge DB and local events
  const map = new Map<string, WallEvent>();
  localEvents.forEach((e) => map.set(e.id, e));
  dbEvents.forEach((e) => map.set(e.id, e));

  return Array.from(map.values());
}

/**
 * Add a new event to WallCalendar (Supabase DB + Local Storage)
 */
export async function addWallCalendarEvent(evt: Omit<WallEvent, "id"> & { id?: string }, userId?: string): Promise<WallEvent> {
  const eventId = evt.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const fullEvt: WallEvent = { ...evt, id: eventId, user_id: userId };

  // 1. Save to Local Storage
  const existing = getLocalEvents(userId);
  saveLocalEvents([...existing.filter((e) => e.id !== eventId), fullEvt], userId);

  // 2. Save to Supabase DB if user is authenticated
  if (userId) {
    try {
      await supabase.from("wall_calendar_events").upsert({
        id: eventId.startsWith("evt_") ? undefined : eventId,
        user_id: userId,
        title: evt.title,
        event_date: evt.date,
        event_time: evt.time || "12:00",
        category: evt.category,
        description: evt.description || "",
        link: evt.link || "",
        source_type: evt.source_type || "custom",
        source_id: evt.source_id || "",
      });
    } catch {}
  }

  return fullEvt;
}

/**
 * Remove an event from WallCalendar by ID or source_id
 */
export async function deleteWallCalendarEvent(idOrSourceId: string, userId?: string): Promise<void> {
  // 1. Update Local Storage
  const existing = getLocalEvents(userId);
  const updated = existing.filter((e) => e.id !== idOrSourceId && e.source_id !== idOrSourceId);
  saveLocalEvents(updated, userId);

  // 2. Delete from Supabase DB
  if (userId) {
    try {
      await supabase
        .from("wall_calendar_events")
        .delete()
        .or(`id.eq.${idOrSourceId},source_id.eq.${idOrSourceId}`)
        .eq("user_id", userId);
    } catch {}
  }
}

/**
 * Automatically sync Study Desk Track creation / deletion with WallCalendar
 */
export async function syncStudyPathWithCalendar(action: "create" | "delete", path: { id: string; title: string; targetDate?: string }, userId?: string) {
  if (action === "delete") {
    await deleteWallCalendarEvent(path.id, userId);
  } else if (action === "create") {
    const dateStr = path.targetDate || new Date().toISOString().split("T")[0];
    await addWallCalendarEvent(
      {
        title: `[Study Path] ${path.title}`,
        date: dateStr,
        time: "18:00",
        category: "study",
        description: "Study desk active track milestone target.",
        link: "/study-desk",
        source_type: "study_path",
        source_id: path.id,
      },
      userId
    );
  }
}

/**
 * Automatically sync Event Desk registration / unregistration with WallCalendar
 */
export async function syncEventDeskWithCalendar(action: "join" | "leave", event: { id: string; title: string; date?: string; category?: string }, userId?: string) {
  if (action === "leave") {
    await deleteWallCalendarEvent(event.id, userId);
  } else if (action === "join") {
    const dateStr = event.date || new Date().toISOString().split("T")[0];
    await addWallCalendarEvent(
      {
        title: `[Event Desk] ${event.title}`,
        date: dateStr,
        time: "10:00",
        category: event.category === "contest" ? "contest" : "deadline",
        description: "Registered contest/hackathon in Event Desk.",
        link: "/event-desk",
        source_type: "event_desk",
        source_id: event.id,
      },
      userId
    );
  }
}
