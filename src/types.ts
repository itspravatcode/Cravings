export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  fcmToken?: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
};

export type GroupType = 'OFFICE' | 'COLLEGE' | 'CLASS' | 'FRIENDS';

export type Group = {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
  createdAt: string;
};

export type SnackPlanStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

export type SnackPlan = {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description: string;
  time: string; // ISO string
  location: string;
  participantLimit: number;
  participantIds: string[];
  status: SnackPlanStatus;
  createdAt: string;
};

export type PollOption = {
  id: string;
  text: string;
  voteCount: number;
  voterIds: string[];
};

export type PollStatus = 'ACTIVE' | 'CLOSED';

export type Poll = {
  id: string;
  groupId: string;
  creatorId: string;
  question: string;
  options: PollOption[];
  expiresAt: string; // ISO string
  status: PollStatus;
  createdAt: string;
  userVote?: string; // option id the current user voted for
};

export type PickupItem = {
  id: string;
  name: string;
  quantity: number;
};

export type PickupOfferStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED';

export type PickupOffer = {
  id: string;
  groupId: string;
  creatorId: string;
  title: string;
  description: string;
  items: PickupItem[];
  time: string; // ISO string
  location: string;
  status: PickupOfferStatus;
  createdAt: string;
};

export type PickupRequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export type PickupRequest = {
  id: string;
  pickupOfferId: string;
  requesterId: string;
  items: PickupItem[];
  status: PickupRequestStatus;
  createdAt: string;
};

export type FeedItemType = 'plan' | 'poll' | 'pickup';

export type FeedItem = {
  id: string;
  groupId: string;
  type: FeedItemType;
  entityId: string;
  actorId: string;
  action: string;
  createdAt: string;
};