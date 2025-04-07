import {
  NotFound,
  NotAuthorized,
} from './errors';
import {
  model as Group,
} from '../models/group';

export function removeMessagesFromMember (member, groupId) {
  if (member.newMessages[groupId]) {
    delete member.newMessages[groupId];
    member.markModified('newMessages');
  }

  member.notifications = member.notifications.filter(n => {
    if (n && n.type === 'NEW_CHAT_MESSAGE' && n.data && n.data.group && n.data.group.id === groupId) {
      return false;
    }

    return true;
  });
}

export async function leaveGroup (data) {
  const {
    groupId,
    user,
    res,
    keep,
    keepChallenges,
  } = data;
  const group = await Group.getGroup({
    user, groupId, fields: '-chat', requireMembership: true,
  });
  if (!group) {
    throw new NotFound(res.t('groupNotFound'));
  }

  // During quests, check if user can leave
  if (group.type === 'party') {
    if (group.quest && group.quest.leader === user._id) {
      throw new NotAuthorized(res.t('questLeaderCannotLeaveGroup'));
    }

    if (
      group.quest && group.quest.active
      && group.quest.members && group.quest.members[user._id]
    ) {
      throw new NotAuthorized(res.t('cannotLeaveWhileActiveQuest'));
    }
  }

  await group.leave(user, keep, keepChallenges);
  removeMessagesFromMember(user, group._id);
  await user.save();

  if (group.hasNotCancelled()) await group.updateGroupPlan(true);
}
