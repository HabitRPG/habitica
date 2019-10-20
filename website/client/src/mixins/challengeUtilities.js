export default {
  methods: {
    isMemberOfChallenge (user, challenge) {
      return user.challenges.indexOf(challenge._id) !== -1;
    },
  },
};
