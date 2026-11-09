import type { SlotMode } from '@/lib/slots';

/** Wire format of `GET /api/events/[id]` – everything the room UI needs, no secrets. */
export interface RoomParticipant {
  id: string;
  nickname: string;
  isHost: boolean;
  image: string | null;
}

export interface RoomLocation {
  id: string;
  name: string;
  mapUrl: string | null;
  notes: string | null;
}

export interface RoomData {
  id: string;
  title: string;
  hostNickname: string;
  slotMode: SlotMode;
  hourStart: number;
  hourEnd: number;
  maxParticipants: number;
  participantCount: number;
  expiresAt: string; // ISO (UTC)
  createdAt: string;
  isFinalized: boolean;
  hasPasscode: boolean;
  final: {
    date: string;
    slot: string;
    location: { name: string; mapUrl: string | null; notes: string | null } | null;
  } | null;
  participants: RoomParticipant[];
  availabilities: { participantId: string; date: string; slot: string }[];
  locations: RoomLocation[];
  locationVotes: { participantId: string; locationOptionId: string }[];
  /** The caller's own participant record (device token or account), if they already joined. */
  meId: string | null;
  isMember: boolean;
  /** Authenticated host: may kick and finalize. */
  canManage: boolean;
}

export interface ApiErrorBody {
  code: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  count?: number;
  max?: number;
  title?: string;
  hostNickname?: string;
  participantCount?: number;
  maxParticipants?: number;
  retryAfterSec?: number;
}
