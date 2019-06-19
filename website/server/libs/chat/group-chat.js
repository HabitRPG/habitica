import { chatModel as Chat } from '../../models/message';
import shared from '../../../common';
import _ from 'lodash';
import { MAX_CHAT_COUNT, MAX_SUBBED_GROUP_CHAT_COUNT } from '../../models/group';

const questScrolls = shared.content.quests;

// @TODO: Don't use this method when the group can be saved.
export async function getGroupChat (group) {
  const maxChatCount = group.isSubscribed() ? MAX_SUBBED_GROUP_CHAT_COUNT : MAX_CHAT_COUNT;

  const groupChat = await Chat.find({groupId: group._id})
    .limit(maxChatCount)
    .sort('-timestamp')
    .exec();

  // @TODO: Concat old chat to keep continuity of chat stored on group object
  const currentGroupChat = group.chat || [];
  const concatedGroupChat = groupChat.concat(currentGroupChat);

  group.chat = concatedGroupChat.reduce((previous, current) => {
    const foundMessage = previous.find(message => {
      return message.id === current.id;
    });
    if (!foundMessage) previous.push(current);
    return previous;
  }, []);
}

export function translateMessage (lang, info) {
  let msg;
  let foundText = '';
  let spells = shared.content.spells;
  let quests = shared.content.quests;

  switch (info.type) {
    case 'quest_start':
      msg = `\`${shared.i18n.t('chatQuestStarted', {questName: questScrolls[info.quest].text(lang)}, lang)}\``;
      break;

    case 'boss_damage':
      msg = `\`${shared.i18n.t('chatBossDamage', {username: info.user, bossName: questScrolls[info.quest].boss.name(lang), userDamage: info.userDamage, bossDamage: info.bossDamage}, lang)}\``;
      break;

    case 'boss_dont_attack':
      msg = `\`${shared.i18n.t('chatBossDontAttack', {username: info.user, bossName: questScrolls[info.quest].boss.name(lang), userDamage: info.userDamage}, lang)}\``;
      break;

    case 'boss_rage':
      msg = `\`${questScrolls[info.quest].boss.rage.effect(lang)}\``;
      break;

    case 'boss_defeated':
      msg = `\`${shared.i18n.t('chatBossDefeated', {bossName: questScrolls[info.quest].boss.name(lang)}, lang)}\``;
      break;

    case 'user_found_items':
      foundText = _.reduce(info.items, (m, v, k) => {
        m.push(`${v} ${questScrolls[info.quest].collect[k].text(lang)}`);
        return m;
      }, []).join(', ');
      msg = `\`${shared.i18n.t('chatFindItems', {username: info.user, items: foundText}, lang)}\``;
      break;

    case 'all_items_found':
      msg = `\`${shared.i18n.t('chatItemQuestFinish', lang)}\``;
      break;

    case 'spell_cast_party':
      msg = `\`${shared.i18n.t('chatCastSpellParty', {username: info.user, spell: spells[info.class][info.spell].text(lang)}, lang)}\``;
      break;

    case 'spell_cast_user':
      msg = `\`${shared.i18n.t('chatCastSpellUser', {username: info.user, spell: spells[info.class][info.spell].text(lang), target: info.target}, lang)}\``;
      break;

    case 'quest_cancel':
      msg = `\`${shared.i18n.t('chatQuestCancelled', {username: info.user, questName: questScrolls[info.quest].text(lang)}, lang)}\``;
      break;

    case 'quest_abort':
      msg = `\`${shared.i18n.t('chatQuestAborted', {username: info.user, questName: questScrolls[info.quest].text(lang)}, lang)}\``;
      break;

    case 'tavern_quest_completed':
      msg = `\`${quests[info.quest].completionChat(lang)}\``;
      break;

    case 'tavern_boss_rage_tired':
      msg = `\`${shared.i18n.t('tavernBossTired', {rageName: quests[info.quest].boss.rage.title(lang), bossName: quests[info.quest].boss.name(lang)}, lang)}\``;
      break;

    case 'tavern_boss_rage':
      msg = `\`${quests[info.quest].boss.rage[info.scene](lang)}\``;
      break;

    case 'tavern_boss_desperation':
      msg = `\`${quests[info.quest].boss.desperation.text(lang)}\``;
      break;

    case 'claim_task':
      msg = `${shared.i18n.t('userIsClamingTask', {username: info.user, task: info.task}, lang)}`;
      break;
  }

  return msg;
}
