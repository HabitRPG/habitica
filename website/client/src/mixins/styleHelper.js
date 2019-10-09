export default {
  methods: {
    userLevelStyle (user, style) {
      style = style || '';
      const npc = user && user.backer && user.backer.npc ? user.backer.npc : '';
      const level = user && user.contributor && user.contributor.level ? user.contributor.level : '';
      style += this.userLevelStyleFromLevel(level, npc, style);
      return style;
    },
    userLevelStyleFromLevel (level, npc, style) {
      style = style || '';
      if (npc) style += ' npc';
      style += level ? ` tier${level}` : ' no-tier';

      return style;
    },
  },
};
