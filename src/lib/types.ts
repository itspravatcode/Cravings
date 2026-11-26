// Mirrors the backend DTOs (see Cravings_Backend/API_DOCS.md). Timestamps are ISO-8601 UTC strings.

export type Id = number;

export type Page<T> = { items: T[]; page: number; size: number; hasNext: boolean };

export type UserSummary = { id: Id; name: string; username: string; avatarUrl: string | null };

export type Me = UserSummary & { email: string; termsAccepted: boolean; createdAt: string };

export type AuthResponse = { accessToken: string; tokenType: 'Bearer'; expiresAt: string; user: Me };

export type ProfileStats = {
  groups: number;
  plansJoined: number;
  pollsVoted: number;
  pickupOffers: number;
  pickupRequests: number;
};

export type GroupRef = { id: Id; name: string };

export type GroupType = 'OFFICE' | 'COLLEGE' | 'CLASS' | 'FRIENDS';
export type JoinMode = 'OPEN' | 'APPROVAL';
export type MemberRole = 'OWNER' | 'MEMBER';
export type MemberStatus = 'ACTIVE' | 'PENDING';

export type GroupSummary = {
  id: Id;
  name: string;
  type: GroupType;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  myRole: MemberRole;
  myStatus: MemberStatus;
};

export type GroupDetail = {
  id: Id;
  name: string;
  type: GroupType;
  description: string | null;
  imageUrl: string | null;
  joinMode: JoinMode;
  inviteCode: string;
  memberCount: number;
  membersPreview: UserSummary[];
  myRole: MemberRole | null;
  chatMuted: boolean;
  createdAt: string;
};

export type GroupPreview = {
  id: Id;
  name: string;
  type: GroupType;
  description: string | null;
  imageUrl: string | null;
  joinMode: JoinMode;
  memberCount: number;
  myStatus: MemberStatus | null;
};

export type MemberView = { user: UserSummary; role: MemberRole; status: MemberStatus; joinedAt: string | null };

export type JoinResult = { status: MemberStatus; group: GroupPreview };

export type PlanStatus = 'OPEN' | 'FULL' | 'STARTED' | 'COMPLETED' | 'CANCELLED';

export type Plan = {
  id: Id;
  group: GroupRef;
  creator: UserSummary;
  title: string;
  description: string | null;
  location: string;
  startsAt: string;
  participantLimit: number | null;
  participantCount: number;
  participantsPreview: UserSummary[];
  joined: boolean;
  status: PlanStatus;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PollStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export type PollOption = { id: Id; label: string; votes: number; percent: number; winner: boolean };

export type Poll = {
  id: Id;
  group: GroupRef;
  creator: UserSummary;
  question: string;
  status: PollStatus;
  closesAt: string;
  allowVoteChange: boolean;
  options: PollOption[];
  totalVotes: number;
  myOptionId: Id | null;
  votersPreview: UserSummary[];
  publishedAt: string | null;
  createdAt: string;
};

export type PickupCategory = 'SNACKS' | 'DRINKS' | 'ESSENTIALS';
export type PickupOfferStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';
export type PickupRequestStatus = 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'DECLINED' | 'CANCELLED';

export type PickupOffer = {
  id: Id;
  group: GroupRef;
  creator: UserSummary;
  destination: string;
  note: string | null;
  availableUntil: string;
  categories: PickupCategory[];
  status: PickupOfferStatus;
  requestCount: number;
  myOpenRequestCount: number;
  createdAt: string;
};

export type PickupRequest = {
  id: Id;
  offerId: Id;
  offerDestination: string;
  requester: UserSummary;
  itemName: string;
  category: PickupCategory;
  quantity: number;
  note: string | null;
  status: PickupRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type FeedType = 'PLAN' | 'POLL' | 'PICKUP';

export type FeedItem =
  | { type: 'PLAN'; createdAt: string; plan: Plan }
  | { type: 'POLL'; createdAt: string; poll: Poll }
  | { type: 'PICKUP'; createdAt: string; pickup: PickupOffer };

export type ActivityType =
  | 'GROUP_INVITE' | 'GROUP_JOIN_REQUESTED' | 'GROUP_JOIN_APPROVED'
  | 'PLAN_CREATED' | 'PLAN_JOINED' | 'PLAN_LEFT' | 'PLAN_UPDATED' | 'PLAN_CANCELLED'
  | 'POLL_CREATED' | 'POLL_CLOSING' | 'POLL_CLOSED'
  | 'PICKUP_OFFER_CREATED' | 'PICKUP_REQUESTED' | 'PICKUP_REQUEST_ACCEPTED' | 'PICKUP_REQUEST_DECLINED'
  | 'PICKUP_REQUEST_COMPLETED' | 'PICKUP_REQUEST_CANCELLED'
  | 'REPORT_SUBMITTED';

export type ActivitySubject = 'GROUP' | 'PLAN' | 'POLL' | 'PICKUP_OFFER' | 'PICKUP_REQUEST';

export type ActivityCategory = 'ALL' | 'GROUPS' | 'PLANS' | 'POLLS' | 'PICKUPS';

export type Activity = {
  id: Id;
  type: ActivityType;
  actor: UserSummary | null;
  group: GroupRef | null;
  subjectType: ActivitySubject;
  subjectId: Id;
  subjectTitle: string | null;
  read: boolean;
  createdAt: string;
};

export type ChatMessage = {
  id: Id;
  groupId: Id;
  sender: UserSummary | null;
  body: string | null;
  deleted: boolean;
  clientId: string | null;
  createdAt: string;
};

/** A message as the app holds it: server messages, plus our own while sending or after a failed send. */
export type LocalMessage = ChatMessage & { pending?: 'sending' | 'failed' };

export type MessagePage = { items: LocalMessage[]; hasMore: boolean };

export type ChatUnread = { total: number; byGroup: Record<string, number> };

export type NotificationSettings = { groups: boolean; plans: boolean; polls: boolean; pickups: boolean; chat: boolean };

export type ReportTarget = 'MESSAGE' | 'USER' | 'PLAN' | 'POLL' | 'PICKUP';
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'OTHER';

export type Report = {
  id: Id;
  targetType: ReportTarget;
  targetId: Id;
  targetUser: UserSummary | null;
  snapshot: string | null;
  reason: ReportReason;
  details: string | null;
  status: 'OPEN' | 'REMOVED' | 'DISMISSED';
  createdAt: string;
};
