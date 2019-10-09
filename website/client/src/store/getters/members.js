import memberHasClass from '@/../../common/script/libs/hasClass';

export function isBuffed () {
  return member => {
    const { buffs } = member.stats;
    return buffs.str || buffs.per || buffs.con || buffs.int;
  };
}

export function hasClass () {
  return memberHasClass;
}
