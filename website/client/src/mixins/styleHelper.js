export default {
  methods: {
    userLevelStyle (user, style) {
      style = style || ''; // eslint-disable-line no-param-reassign, max-len
      const npc = user && user.backer && user.backer.npc ? user.backer.npc : '';
      const level = user && user.contributor && user.contributor.level ? user.contributor.level : '';
      style += this.userLevelStyleFromLevel(level, npc, style); // eslint-disable-line no-param-reassign, max-len
      return style;
    },
    userLevelStyleFromLevel (level, npc, style) {
      style = style || ''; // eslint-disable-line no-param-reassign, max-len
      if (npc) style += ' npc'; // eslint-disable-line no-param-reassign, max-len
      style += level ? ` tier${level}` : ' no-tier'; // eslint-disable-line no-param-reassign, max-len

      return style;
    },
  },
};
