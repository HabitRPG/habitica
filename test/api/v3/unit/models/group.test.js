import { sleep } from '../../../../helpers/api-unit.helper';
import { model as Group } from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import { quests as questScrolls } from '../../../../../common/script/content';
import * as email from '../../../../../website/server/libs/api-v3/email';

describe('Group Model', () => {
  let party, questLeader, participatingMember, nonParticipatingMember, undecidedMember;

  beforeEach(async () => {
    sandbox.stub(email, 'sendTxn');

    party = new Group({
      name: 'test party',
      type: 'party',
      privacy: 'private',
    });

    questLeader = new User({
      party: { _id: party._id },
      profile: { name: 'Quest Leader' },
      items: {
        quests: {
          whale: 1,
        },
      },
    });

    party.leader = questLeader._id;

    participatingMember = new User({
      party: { _id: party._id },
      profile: { name: 'Participating Member' },
    });
    nonParticipatingMember = new User({
      party: { _id: party._id },
      profile: { name: 'Non-Participating Member' },
    });
    undecidedMember = new User({
      party: { _id: party._id },
      profile: { name: 'Undecided Member' },
    });

    await Promise.all([
      party.save(),
      questLeader.save(),
      participatingMember.save(),
      nonParticipatingMember.save(),
      undecidedMember.save(),
    ]);
  });

  context('Instance Methods', () => {
    describe('#startQuest', () => {
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
          party.quest.members = {
            [questLeader._id]: true,
            [participatingMember._id]: true,
            [nonParticipatingMember._id]: false,
            [undecidedMember._id]: null,
          };
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
          expect(participatingMember.party.quest.progress.collect).to.eql(0);
          expect(participatingMember.party.quest.completed).to.eql(null);
        });

        it('applies updates to other participating members', async () => {
          await party.startQuest(nonParticipatingMember);

          questLeader = await User.findById(questLeader._id);
          participatingMember = await User.findById(participatingMember._id);

          expect(participatingMember.party.quest.key).to.eql('whale');
          expect(participatingMember.party.quest.progress.down).to.eql(0);
          expect(participatingMember.party.quest.progress.collect).to.eql(0);
          expect(participatingMember.party.quest.completed).to.eql(null);

          expect(questLeader.party.quest.key).to.eql('whale');
          expect(questLeader.party.quest.progress.down).to.eql(0);
          expect(questLeader.party.quest.progress.collect).to.eql(0);
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
          expect(userQuest.progress.collect).to.eql(0);
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

    describe('processQuestProgress', () => {
      let progress;

      beforeEach(async () => {
        progress = {
          up: 5,
          down: -5,
        };

        party.quest.active = true;
        party.quest.members = {
          [questLeader._id]: true,
          [participatingMember._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };

        await party.save();

        sandbox.stub(Group, 'processBossQuest').returns(Promise.resolve());
        sandbox.stub(Group, 'processCollectionQuest').returns(Promise.resolve());
      });

      it('returns early if user is not in a party', async () => {
        let userWithoutParty = new User();

        await userWithoutParty.save();

        await Group.processQuestProgress(userWithoutParty, progress);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('returns early if party is not on quest', async () => {
        party.quest.active = false;
        await party.save();

        await Group.processQuestProgress(participatingMember, progress);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('returns early if user is not on quest', async () => {
        await Group.processQuestProgress(nonParticipatingMember, progress);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('returns early if user has made no progress', async () => {
        await Group.processQuestProgress(participatingMember, null);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('returns early if quest does not exist', async () => {
        party.quest.key = 'foobar';
        await party.save();

        await Group.processQuestProgress(participatingMember, progress);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('calls processBossQuest if quest is a boss quest', async () => {
        party.quest.key = 'whale';
        await party.save();

        await Group.processQuestProgress(participatingMember, progress);

        expect(Group.processBossQuest).to.be.calledOnce;
        expect(Group.processCollectionQuest).to.not.be.called;
      });

      it('calls processCollectionQuest if quest is a boss quest', async () => {
        party.quest.key = 'evilsanta2';
        await party.save();

        await Group.processQuestProgress(participatingMember, progress);

        expect(Group.processBossQuest).to.not.be.called;
        expect(Group.processCollectionQuest).to.be.calledOnce;
      });
    });

    describe('processBossQuest', () => {
      let progress, quest;

      beforeEach(async () => {
        progress = {
          up: 5,
          down: -5,
        };
        quest = questScrolls.whale;

        party.quest.members = {
          [questLeader._id]: true,
          [participatingMember._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };
        party.quest.key = 'whale';

        await party.save();
        await party.startQuest(questLeader);

        sandbox.stub(party, 'sendChat');
      });

      it('applies user\'s progress to quest boss hp', async () => {
        await Group.processBossQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.quest.progress.hp).to.eql(495);
      });

      it('sends a chat message about progress', async () => {
        await Group.processBossQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.sendChat).to.be.calledOnce;
        expect(party.sendChat).to.be.calledWith('`Participating Member attacks Wailing Whale for 5.0 damage.` `Wailing Whale attacks party for 7.5 damage.`');
      });

      it('applies damage only to participating members of party', async () => {
        await Group.processBossQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        let [
          updatedLeader,
          updatedParticipatingMember,
          updatedNonParticipatingMember,
          updatedUndecidedMember,
        ] = await Promise.all([
          User.findById(questLeader._id),
          User.findById(participatingMember._id),
          User.findById(nonParticipatingMember._id),
          User.findById(undecidedMember._id),
        ]);

        expect(updatedLeader.stats.hp).to.eql(42.5);
        expect(updatedParticipatingMember.stats.hp).to.eql(42.5);
        expect(updatedNonParticipatingMember.stats.hp).to.eql(50);
        expect(updatedUndecidedMember.stats.hp).to.eql(50);
      });

      it('sends message about victory', async () => {
        progress.up = 999;

        await Group.processBossQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.sendChat).to.be.calledTwice;
        expect(party.sendChat).to.be.calledWith('`You defeated Wailing Whale! Questing party members receive the rewards of victory.`');
      });

      it('calls finishQuest when boss has <= 0 hp', async () => {
        progress.up = 999;
        sandbox.spy(party, 'finishQuest');

        await Group.processBossQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.finishQuest).to.be.calledOnce;
        expect(party.finishQuest).to.be.calledWith(quest);
      });

      context('rage quests', () => {
        beforeEach(async () => {
          party.quest.active = false;
          party.quest.key = 'trex_undead';
          quest = questScrolls[party.quest.key];

          await party.save();

          await party.startQuest(questLeader);
        });

        it('applies down progress to boss rage', async () => {
          await Group.processBossQuest({
            user: participatingMember,
            progress,
            quest,
            group: party,
          });

          expect(party.quest.progress.rage).to.eql(10);
        });

        it('activates rage when progress.down triggers rage bar', async () => {
          progress.down = -999;

          party.quest.progress.hp = 300;

          await Group.processBossQuest({
            user: participatingMember,
            progress,
            quest,
            group: party,
          });

          expect(party.sendChat).to.be.calledWith(quest.boss.rage.effect('en'));
          expect(party.quest.progress.hp).to.eql(383.5);
          expect(party.quest.progress.rage).to.eql(0);
        });

        it('rage sets boss hp to max hp if raging would have caused hp to be higher than the max', async () => {
          progress.down = -999;

          party.quest.progress.hp = 490;

          await Group.processBossQuest({
            user: participatingMember,
            progress,
            quest,
            group: party,
          });

          expect(party.quest.progress.hp).to.eql(500);
        });
      });
    });

    describe('processCollectionQuest', () => {
      let progress, quest;

      beforeEach(async () => {
        progress = {
          collect: 5,
        };
        quest = questScrolls.atom1;

        party.quest.members = {
          [questLeader._id]: true,
          [participatingMember._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };
        party.quest.key = 'atom1';

        await party.save();
        await party.startQuest(questLeader);

        sandbox.stub(party, 'sendChat');
      });

      it('applies user\'s progress to found quest items', async () => {
        await Group.processCollectionQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.quest.progress.collect.soapBars).to.eq(5);
      });

      it('sends a chat message about progress', async () => {
        await Group.processCollectionQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.sendChat).to.be.calledOnce;
        expect(party.sendChat).to.be.calledWith('`Participating Member found 5 Bars of Soap.`');
      });

      it('sends a chat message if no progress is made', async () => {
        progress.collect = 0;

        await Group.processCollectionQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.sendChat).to.be.calledOnce;
        expect(party.sendChat).to.be.calledWith('`Participating Member found nothing.`');
      });

      it('sends message about victory', async () => {
        progress.collect = 500;

        await Group.processCollectionQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.sendChat).to.be.calledTwice;
        expect(party.sendChat).to.be.calledWith('`All items found! Party has received their rewards.`');
      });

      it('calls finishQuest when all items are found', async () => {
        progress.collect = 999;
        sandbox.spy(party, 'finishQuest');

        await Group.processCollectionQuest({
          user: participatingMember,
          progress,
          quest,
          group: party,
        });

        expect(party.finishQuest).to.be.calledOnce;
        expect(party.finishQuest).to.be.calledWith(quest);
      });
    });
  });
});
