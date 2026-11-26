import type { Href } from 'expo-router';
import type { ActivitySubject, ActivityType, Id } from './types';

/** Where an activity (in the list or from a push notification) should take the user. */
export function hrefForActivity(a: { type: ActivityType; subjectType: ActivitySubject; subjectId: Id; subjectTitle?: string | null }): Href {
  if (a.type === 'REPORT_SUBMITTED') return `/reports/${a.subjectId}`;
  switch (a.subjectType) {
    case 'PLAN': return `/plans/${a.subjectId}`;
    case 'POLL': return `/polls/${a.subjectId}`;
    case 'GROUP':
      return a.type === 'GROUP_INVITE'
        ? `/groups/join?groupId=${a.subjectId}&name=${encodeURIComponent(a.subjectTitle ?? '')}`
        : `/groups/${a.subjectId}`;
    case 'PICKUP_OFFER': return `/pickups/${a.subjectId}`;
    case 'PICKUP_REQUEST': return '/me/pickup-requests';
  }
}
