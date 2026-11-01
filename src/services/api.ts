import { Group, SnackPlan, Poll, PickupOffer, User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the correct base URL for the backend.
//
// Priority order:
// 1. EXPO_PUBLIC_API_URL environment variable (set in .env or app.json extra)
// 2. Derived from Metro dev server host (Constants.expoConfig.hostUri) — works on
//    physical devices & Expo Go without editing code when your IP changes.
// 3. Platform-specific fallback defaults.
//
// For physical devices, make sure your backend is bound to 0.0.0.0 (not just
// localhost) and that port 8080 is open in your firewall.
const getApiBase = (): string => {
  // 1. Environment variable (highest priority)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Derive from Metro dev server host URI (e.g. "192.168.1.100:8081" or "localhost:19000")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8080`;
    }
  }

  // 3. Platform-specific fallbacks
  if (Platform.OS === 'android') {
    // Android Emulator: 10.0.2.2 is the special alias for the host machine
    return 'http://10.0.2.2:8080';
  }
  // iOS Simulator shares the host's network, so localhost works
  return 'http://localhost:8080';
};

const API_BASE = getApiBase();

// The backend wraps every response in this envelope:
//   { success: boolean, message: string, data: T }
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Default user id sent as the `X-User-Id` header. The backend defaults to "1"
// when the header is omitted. In a production app this should be the logged-in
// user's id (threaded in from auth state).
const DEFAULT_USER_ID = '1';

function userHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-User-Id': DEFAULT_USER_ID,
    ...extra,
  };
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Merge init.headers with Content-Type instead of letting `...init` wipe it.
    const { headers: initHeaders, ...rest } = init || {};
    const res = await fetch(input, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...initHeaders,
      },
      ...rest,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(errorBody || `Request failed with status ${res.status}`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Connection timed out. Make sure the backend is running on ${API_BASE}`);
    }
    throw err;
  }
}

export const api = {
  // Auth ---------------------------------------------------------------
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await request<BackendApiResponse<AuthResponse>>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return res.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await request<BackendApiResponse<AuthResponse>>(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return res.data;
  },

  getUser: async (id: string, token?: string): Promise<{ user: User }> => {
    const res = await request<BackendApiResponse<User>>(`${API_BASE}/auth/users/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return { user: res.data };
  },

  logout: async (): Promise<void> => {
    await request<BackendApiResponse<string>>(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: userHeaders(),
    });
  },

  // Groups -------------------------------------------------------------
  getGroups: async (): Promise<Group[]> => {
    const res = await request<BackendApiResponse<Group[]>>(`${API_BASE}/groups`, {
      headers: userHeaders(),
    });
    return res.data;
  },

  getGroup: async (id: string): Promise<Group> => {
    const res = await request<BackendApiResponse<Group>>(`${API_BASE}/groups/${id}`, {
      headers: userHeaders(),
    });
    return res.data;
  },

  createGroup: async (data: Partial<Group>): Promise<Group> => {
    const res = await request<BackendApiResponse<Group>>(`${API_BASE}/groups`, {
      method: 'POST',
      headers: userHeaders(),
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        // Backend GroupType enum is uppercase (OFFICE/COLLEGE/CLASS/FRIENDS).
        type: data.type ? String(data.type).toUpperCase() : undefined,
      }),
    });
    return res.data;
  },

  joinGroup: async (inviteCode: string): Promise<Group> => {
    const res = await request<BackendApiResponse<Group>>(
      `${API_BASE}/groups/join?inviteCode=${encodeURIComponent(inviteCode)}`,
      { method: 'POST', headers: userHeaders() }
    );
    return res.data;
  },

  // Plans --------------------------------------------------------------
  getPlans: async (groupId?: string): Promise<SnackPlan[]> => {
    const url = groupId
      ? `${API_BASE}/plans?groupId=${encodeURIComponent(groupId)}`
      : `${API_BASE}/plans`;
    const res = await request<BackendApiResponse<SnackPlan[]>>(url, {
      headers: userHeaders(),
    });
    return res.data;
  },

  getPlan: async (id: string): Promise<SnackPlan> => {
    const res = await request<BackendApiResponse<SnackPlan>>(`${API_BASE}/plans/${id}`, {
      headers: userHeaders(),
    });
    return res.data;
  },

  createPlan: async (data: Partial<SnackPlan>): Promise<SnackPlan> => {
    const res = await request<BackendApiResponse<SnackPlan>>(`${API_BASE}/plans`, {
      method: 'POST',
      headers: userHeaders(),
      body: JSON.stringify({
        groupId: data.groupId,
        title: data.title,
        description: data.description,
        time: data.time,
        location: data.location,
        participantLimit: data.participantLimit,
      }),
    });
    return res.data;
  },

  joinPlan: async (planId: string): Promise<SnackPlan> => {
    const res = await request<BackendApiResponse<SnackPlan>>(`${API_BASE}/plans/${planId}/join`, {
      method: 'POST',
      headers: userHeaders(),
    });
    return res.data;
  },

  leavePlan: async (planId: string): Promise<SnackPlan> => {
    const res = await request<BackendApiResponse<SnackPlan>>(`${API_BASE}/plans/${planId}/leave`, {
      method: 'POST',
      headers: userHeaders(),
    });
    return res.data;
  },

  // Polls --------------------------------------------------------------
  getPolls: async (groupId: string): Promise<Poll[]> => {
    const res = await request<BackendApiResponse<Poll[]>>(
      `${API_BASE}/polls?groupId=${encodeURIComponent(groupId)}`,
      { headers: userHeaders() }
    );
    return res.data;
  },

  getPoll: async (id: string): Promise<Poll> => {
    const res = await request<BackendApiResponse<Poll>>(`${API_BASE}/polls/${id}`, {
      headers: userHeaders(),
    });
    return res.data;
  },

  createPoll: async (data: Partial<Poll>): Promise<Poll> => {
    const res = await request<BackendApiResponse<Poll>>(`${API_BASE}/polls`, {
      method: 'POST',
      headers: userHeaders(),
      body: JSON.stringify({
        groupId: data.groupId,
        question: data.question,
        // Backend expects options as a list of option-text strings.
        options: (data.options || []).map((o) => (typeof o === 'string' ? o : o.text)),
        expiresAt: data.expiresAt,
      }),
    });
    return res.data;
  },

  votePoll: async (pollId: string, optionId: string): Promise<Poll> => {
    const res = await request<BackendApiResponse<Poll>>(`${API_BASE}/polls/vote`, {
      method: 'POST',
      headers: userHeaders(),
      body: JSON.stringify({ pollId, optionId, userId: DEFAULT_USER_ID }),
    });
    return res.data;
  },

  // Pickups ------------------------------------------------------------
  getPickups: async (groupId: string): Promise<PickupOffer[]> => {
    const res = await request<BackendApiResponse<PickupOffer[]>>(
      `${API_BASE}/pickups?groupId=${encodeURIComponent(groupId)}`,
      { headers: userHeaders() }
    );
    return res.data;
  },

  getPickup: async (id: string): Promise<PickupOffer> => {
    const res = await request<BackendApiResponse<PickupOffer>>(`${API_BASE}/pickups/${id}`, {
      headers: userHeaders(),
    });
    return res.data;
  },

  createPickup: async (data: Partial<PickupOffer>): Promise<PickupOffer> => {
    const res = await request<BackendApiResponse<PickupOffer>>(`${API_BASE}/pickups`, {
      method: 'POST',
      headers: userHeaders(),
      body: JSON.stringify({
        groupId: data.groupId,
        title: data.title,
        description: data.description,
        // Backend PickupItemRequest only needs name + quantity.
        items: (data.items || []).map(({ name, quantity }) => ({ name, quantity })),
        time: data.time,
        location: data.location,
      }),
    });
    return res.data;
  },
};