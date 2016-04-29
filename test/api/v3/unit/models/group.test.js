import { sleep } from '../../../../helpers/api-unit.helper';
import { model as Group } from '../../../../../website/src/models/group';
import { model as User } from '../../../../../website/src/models/user';
import { quests as questScrolls } from '../../../../../common/script/content';
import * as email from '../../../../../website/src/libs/api-v3/email';

describe('Group Model', () => {
  context('Instance Methods', () => {
    describe('#startQuest', () => {
      let party, questLeader, participatingMember, nonParticipatingMember, undecidedMember;
      let fakeEmail;

      beforeEach(async () => {
        fakeEmail = sandbox.stub(email, 'sendTxn');

        party = new Group({
          name: 'test party',
          type: 'party',
          privacy: 'private',
        });

        questLeader = new User({
          party: { _id: party._id },
          items: {
            quests: {
              whale: 1,
            },
          },
        });

        party.leader = questLeader._id;

        participatingMember = new User({
          party: { _id: party._id },
        });
        nonParticipatingMember = new User({
          party: { _id: party._id },
        });
        undecidedMember = new User({
          party: { _id: party._id },
        });

        await Promise.all([
          party.save(),
          questLeader.save(),
          participatingMember.save(),
          nonParticipatingMember.save(),
          undecidedMember.save(),
        ]);
      });

      context('Failure Conditions', () => {
        it('throws an error if group is not a party', async () => {
          let guild = new Group({
            type: 'guild',
          });

          await expect(guild.startQuest(participatingMember)).to.eventually.be.rejected;
        });

        it('throws an error if party is not on a quest', async () => {
          await expect(party.startQuest(participatingMember)).to.eventually.be.rejected;
        });

        it('throws an error if quest is already active', async () => {
          party.quest.key = 'whale';
          party.quest.active = true;

          await expect(party.startQuest(participatingMember)).to.eventually.be.rejected;
        });
      });

      context('Successes', () => {
        beforeEach(() => {
          party.quest.key = 'whale';
          party.quest.active = false;
          party.quest.leader = questLeader._id;
          party.quest.members = { };
          party.quest.members[questLeader._id] = true;
          party.quest.members[participatingMember._id] = true;
          party.quest.members[nonParticipatingMember._id] = false;
          party.quest.members[undecidedMember._id] = null;
        });

        it('activates quest', () => {
          party.startQuest(participatingMember);

          expect(party.quest.active).to.eql(true);
        });

        it('sets up boss quest', () => {
          let bossQuest = questScrolls.whale;
          party.quest.key = bossQuest.key;

          party.startQuest(participatingMember);

          expect(party.quest.progress.hp).to.eql(bossQuest.boss.hp);
        });

        it('sets up rage meter for rage boss quest', () => {
          let rageBossQuest = questScrolls.trex_undead;
          party.quest.key = rageBossQuest.key;

          party.startQuest(participatingMember);

          expect(party.quest.progress.rage).to.eql(0);
        });

        it('sets up collection quest', () => {
          let collectionQuest = questScrolls.vice2;
          party.quest.key = collectionQuest.key;
          party.startQuest(participatingMember);

          expect(party.quest.progress.collect).to.eql({
            lightCrystal: 0,
          });
        });

        it('sets up collection quest with multiple items', () => {
          let collectionQuest = questScrolls.evilsanta2;
          party.quest.key = collectionQuest.key;
          party.startQuest(participatingMember);

          expect(party.quest.progress.collect).to.eql({
            tracks: 0,
            branches: 0,
          });
        });

        it('prunes non-participating members from quest members object', () => {
          party.startQuest(participatingMember);

          let expectedQuestMembers = {};
          expectedQuestMembers[questLeader._id] = true;
          expectedQuestMembers[participatingMember._id] = true;

          expect(party.quest.members).to.eql(expectedQuestMembers);
        });

        it('applies updates to user object directly if user is participating', async () => {
          await party.startQuest(participatingMember);

          expect(participatingMember.party.quest.key).to.eql('whale');
          expect(participatingMember.party.quest.progress.down).to.eql(0);
          expect(participatingMember.party.quest.progress.collect).to.eql({});
          expect(participatingMember.party.quest.completed).to.eql(null);
        });

        it('applies updates to other participating members', async () => {
          await party.startQuest(nonParticipatingMember);

          questLeader = await User.findById(questLeader._id);
          participatingMember = await User.findById(participatingMember._id);

          expect(participatingMember.party.quest.key).to.eql('whale');
          expect(participatingMember.party.quest.progress.down).to.eql(0);
          expect(participatingMember.party.quest.progress.collect).to.eql({});
          expect(participatingMember.party.quest.completed).to.eql(null);

          expect(questLeader.party.quest.key).to.eql('whale');
          expect(questLeader.party.quest.progress.down).to.eql(0);
          expect(questLeader.party.quest.progress.collect).to.eql({});
          expect(questLeader.party.quest.completed).to.eql(null);
        });

        it('does not apply updates to nonparticipating members', async () => {
          await party.startQuest(participatingMember);

          nonParticipatingMember = await User.findById(nonParticipatingMember ._id);
          undecidedMember = await User.findById(undecidedMember._id);

          expect(nonParticipatingMember.party.quest.key).to.not.eql('whale');
          expect(undecidedMember.party.quest.key).to.not.eql('whale');
        });

        it('sends email to participating members that quest has started', async () => {
          participatingMember.preferences.emailNotifications.questStarted = true;
          questLeader.preferences.emailNotifications.questStarted = true;
          await Promise.all([
            participatingMember.save(),
            questLeader.save(),
          ]);

          await party.startQuest(nonParticipatingMember);

          await sleep(0.5);

          expect(email.sendTxn).to.be.calledOnce;

          let memberIds = _.pluck(email.sendTxn.args[0][0], '_id');
          let typeOfEmail = email.sendTxn.args[0][1];

          expect(memberIds).to.have.a.lengthOf(2);
          expect(memberIds).to.include(participatingMember._id);
          expect(memberIds).to.include(questLeader._id);
          expect(typeOfEmail).to.eql('quest-started');
        });

        it('sends email only to members who have not opted out', async () => {
          participatingMember.preferences.emailNotifications.questStarted = false;
          questLeader.preferences.emailNotifications.questStarted = true;
          await Promise.all([
            participatingMember.save(),
            questLeader.save(),
          ]);

          await party.startQuest(nonParticipatingMember);

          await sleep(0.5);

          expect(email.sendTxn).to.be.calledOnce;

          let memberIds = _.pluck(email.sendTxn.args[0][0], '_id');

          expect(memberIds).to.have.a.lengthOf(1);
          expect(memberIds).to.not.include(participatingMember._id);
          expect(memberIds).to.include(questLeader._id);
        });

        it('does not send email to initiating member', async () => {
          participatingMember.preferences.emailNotifications.questStarted = true;
          questLeader.preferences.emailNotifications.questStarted = true;
          await Promise.all([
            participatingMember.save(),
            questLeader.save(),
          ]);

          await party.startQuest(participatingMember);

          await sleep(0.5);

          expect(email.sendTxn).to.be.calledOnce;

          let memberIds = _.pluck(email.sendTxn.args[0][0], '_id');

          expect(memberIds).to.have.a.lengthOf(1);
          expect(memberIds).to.not.include(participatingMember._id);
          expect(memberIds).to.include(questLeader._id);
        });

        it('updates participting members (not including user)', async () => {
          sandbox.spy(User, 'update');

          await party.startQuest(nonParticipatingMember);

          let members = [questLeader._id, participatingMember._id];

          expect(User.update).to.be.calledWith(
            { _id: { $in: members } },
            {
              $set: {
                'party.quest.key': 'whale',
                'party.quest.progress.down': 0,
                'party.quest.progress.collect': {},
                'party.quest.completed': null,
              },
            }
          );
        });

        it('updates non-user quest leader and decrements quest scroll', async () => {
          sandbox.spy(User, 'update');

          await party.startQuest(participatingMember);

          expect(User.update).to.be.calledWith(
            { _id: questLeader._id },
            {
              $inc: {
                'items.quests.whale': -1,
              },
            }
          );
        });

        it('modifies the participating initiating user directly', async () => {
          await party.startQuest(participatingMember);

          let userQuest = participatingMember.party.quest;

          expect(userQuest.key).to.eql('whale');
          expect(userQuest.progress.down).to.eql(0);
          expect(userQuest.progress.collect).to.eql({});
          expect(userQuest.completed).to.eql(null);
        });

        it('does not modify user if not participating', async () => {
          await party.startQuest(nonParticipatingMember);

          expect(nonParticipatingMember.party.quest.key).to.not.eql('whale');
        });

        it('removes the quest directly if initiating user is the quest leader', async () => {
          await party.startQuest(questLeader);

          expect(questLeader.items.quests.whale).to.eql(0);
        });
      });
    });
  });
});
