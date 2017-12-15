import moment from 'moment';
import { v4 as generateUUID } from 'uuid';
import validator from 'validator';
import { sleep } from '../../../../helpers/api-unit.helper';
import {
  SPAM_MESSAGE_LIMIT,
  SPAM_MIN_EXEMPT_CONTRIB_LEVEL,
  SPAM_WINDOW_LENGTH,
  INVITES_LIMIT,
  model as Group,
} from '../../../../../website/server/models/group';
import { model as User } from '../../../../../website/server/models/user';
import { quests as questScrolls } from '../../../../../website/common/script/content';
import { groupChatReceivedWebhook } from '../../../../../website/server/libs/webhook';
import * as email from '../../../../../website/server/libs/email';
import { TAVERN_ID } from '../../../../../website/common/script/';
import shared from '../../../../../website/common';

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

  describe('Static Methods', () => {
    describe('processQuestProgress', () => {
      let progress;

      beforeEach(async () => {
        progress = {
          up: 5,
          down: -5,
          collectedItems: 5,
        };

        party.quest.members = {
          [questLeader._id]: true,
          [participatingMember._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };

        await party.save();
      });

      context('early returns', () => {
        beforeEach(() => {
          sandbox.stub(Group.prototype, '_processBossQuest').returns(Promise.resolve());
          sandbox.stub(Group.prototype, '_processCollectionQuest').returns(Promise.resolve());
        });

        it('returns early if user is not in a party', async () => {
          let userWithoutParty = new User();

          await userWithoutParty.save();

          await Group.processQuestProgress(userWithoutParty, progress);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('returns early if party is not on quest', async () => {
          party.quest.active = false;
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('returns early if user is not on quest', async () => {
          await Group.processQuestProgress(nonParticipatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('returns early if user has made no progress', async () => {
          await Group.processQuestProgress(participatingMember, null);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('returns early if quest does not exist', async () => {
          party.quest.key = 'foobar';
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('calls _processBossQuest if quest is a boss quest', async () => {
          party.quest.key = 'whale';

          await party.startQuest(questLeader);
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype._processBossQuest).to.be.calledOnce;
          expect(party._processCollectionQuest).to.not.be.called;
        });

        it('calls _processCollectionQuest if quest is a collection quest', async () => {
          party.quest.key = 'evilsanta2';

          await party.startQuest(questLeader);
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party._processBossQuest).to.not.be.called;
          expect(Group.prototype._processCollectionQuest).to.be.calledOnce;
        });
      });

      context('Boss Quests', () => {
        let sendChatStub;

        beforeEach(async () => {
          party.quest.key = 'whale';

          await party.startQuest(questLeader);
          await party.save();

          sendChatStub = sandbox.stub(Group.prototype, 'sendChat');
        });

        afterEach(() => sendChatStub.restore());

        it('applies user\'s progress to quest boss hp', async () => {
          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party.quest.progress.hp).to.eql(495);
        });

        it('sends a chat message about progress', async () => {
          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledOnce;
          expect(Group.prototype.sendChat).to.be.calledWith('`Participating Member attacks Wailing Whale for 5.0 damage.` `Wailing Whale attacks party for 7.5 damage.`');
        });

        it('applies damage only to participating members of party', async () => {
          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

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

        it('applies damage only to participating members of party even under buggy conditions', async () => {
          // stops unfair damage from mbugs like https://github.com/HabitRPG/habitica/issues/7653
          party.quest.members = {
            [questLeader._id]: true,
            [participatingMember._id]: true,
            [nonParticipatingMember._id]: false,
            [undecidedMember._id]: null,
          };
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

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

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledTwice;
          expect(Group.prototype.sendChat).to.be.calledWith('`You defeated Wailing Whale! Questing party members receive the rewards of victory.`');
        });

        it('calls finishQuest when boss has <= 0 hp', async () => {
          let quest = questScrolls[party.quest.key];
          let finishQuest = sandbox.spy(Group.prototype, 'finishQuest');

          progress.up = 999;

          await Group.processQuestProgress(participatingMember, progress);

          expect(finishQuest).to.be.calledOnce;
          expect(finishQuest).to.be.calledWith(quest);
        });

        context('with healing Rage', () => {
          beforeEach(async () => {
            party.quest.active = false;
            party.quest.key = 'trex_undead';

            await party.startQuest(questLeader);
            await party.save();
          });

          it('applies down progress to boss rage', async () => {
            await Group.processQuestProgress(participatingMember, progress);

            party = await Group.findOne({_id: party._id});

            expect(party.quest.progress.rage).to.eql(10);
          });

          it('activates rage when progress.down triggers rage bar', async () => {
            let quest = questScrolls[party.quest.key];

            progress.down = -999;
            party.quest.progress.hp = 300;

            await party.save();
            await Group.processQuestProgress(participatingMember, progress);

            party = await Group.findOne({_id: party._id});

            expect(Group.prototype.sendChat).to.be.calledWith(quest.boss.rage.effect('en'));
            expect(party.quest.progress.hp).to.eql(383.5);
            expect(party.quest.progress.rage).to.eql(0);
          });

          it('rage sets boss hp to max hp if raging would have caused hp to be higher than the max', async () => {
            progress.down = -999;

            party.quest.progress.hp = 490;

            await Group.processQuestProgress(participatingMember, progress);

            party = await Group.findOne({_id: party._id});

            expect(party.quest.progress.hp).to.eql(500);
          });
        });

        context('with Mana drain Rage', () => {
          beforeEach(async () => {
            party.quest.active = false;
            party.quest.key = 'lostMasterclasser4';

            await party.startQuest(questLeader);
            await party.save();
          });

          it('applies down progress to boss rage', async () => {
            progress.down = -2;

            await Group.processQuestProgress(participatingMember, progress);

            party = await Group.findOne({_id: party._id});

            expect(party.quest.progress.rage).to.eql(8);

            let drainedUser = await User.findById(participatingMember._id);
            expect(drainedUser.stats.mp).to.eql(10);
          });

          it('activates rage when progress.down triggers rage bar', async () => {
            let quest = questScrolls[party.quest.key];

            progress.down = -999;

            await party.save();
            await Group.processQuestProgress(participatingMember, progress);

            party = await Group.findOne({_id: party._id});

            expect(Group.prototype.sendChat).to.be.calledWith(quest.boss.rage.effect('en'));
            expect(party.quest.progress.rage).to.eql(0);

            let drainedUser = await User.findById(participatingMember._id);
            expect(drainedUser.stats.mp).to.eql(0);
          });
        });
      });

      context('Collection Quests', () => {
        let sendChatStub;

        beforeEach(async () => {
          party.quest.key = 'atom1';

          await party.startQuest(questLeader);
          await party.save();

          sendChatStub = sandbox.stub(Group.prototype, 'sendChat');
        });

        afterEach(() => sendChatStub.restore());

        it('applies user\'s progress to found quest items', async () => {
          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party.quest.progress.collect.soapBars).to.eq(5);
        });

        it('does not drop an item if not need when on a collection quest', async () => {
          party.quest.key = 'dilatoryDistress1';
          party.quest.active = false;
          await party.startQuest(questLeader);
          party.quest.progress.collect.fireCoral = 20;
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(party.quest.progress.collect.fireCoral).to.eq(20);
        });

        it('sends a chat message about progress', async () => {
          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledOnce;
          expect(Group.prototype.sendChat).to.be.calledWith('`Participating Member found 5 Bars of Soap.`');
        });

        it('sends a chat message if no progress is made', async () => {
          progress.collectedItems = 0;

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledOnce;
          expect(Group.prototype.sendChat).to.be.calledWith('`Participating Member found 0 Bars of Soap.`');
        });

        it('sends a chat message if no progress is made on quest with multiple items', async () => {
          progress.collectedItems = 0;
          party.quest.key = 'dilatoryDistress1';
          party.quest.active = false;

          await party.startQuest(questLeader);
          Group.prototype.sendChat.reset();
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledOnce;
          expect(Group.prototype.sendChat).to.be.calledWithMatch(/`Participating Member found/);
          expect(Group.prototype.sendChat).to.be.calledWithMatch(/0 Blue Fins/);
          expect(Group.prototype.sendChat).to.be.calledWithMatch(/0 Fire Coral/);
        });

        it('handles collection quests with multiple items', async () => {
          progress.collectedItems = 10;
          party.quest.key = 'evilsanta2';
          party.quest.active = false;

          await party.startQuest(questLeader);
          Group.prototype.sendChat.reset();
          await party.save();

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledOnce;
          expect(Group.prototype.sendChat).to.be.calledWithMatch(/`Participating Member found/);
          expect(Group.prototype.sendChat).to.be.calledWithMatch(/\d* (Tracks|Broken Twigs)/);
        });

        it('sends message about victory', async () => {
          progress.collectedItems = 500;

          await Group.processQuestProgress(participatingMember, progress);

          party = await Group.findOne({_id: party._id});

          expect(Group.prototype.sendChat).to.be.calledTwice;
          expect(Group.prototype.sendChat).to.be.calledWith('`All items found! Party has received their rewards.`');
        });

        it('calls finishQuest when all items are found', async () => {
          let quest = questScrolls[party.quest.key];
          let finishQuest = sandbox.spy(Group.prototype, 'finishQuest');

          progress.collectedItems = 999;

          await Group.processQuestProgress(participatingMember, progress);

          expect(finishQuest).to.be.calledOnce;
          expect(finishQuest).to.be.calledWith(quest);
        });

        it('gives out rewards when quest finishes', async () => {
          progress.collectedItems = 999;

          await Group.processQuestProgress(participatingMember, progress);

          let [
            updatedLeader,
            updatedParticipatingMember,
          ] = await Promise.all([
            User.findById(questLeader._id),
            User.findById(participatingMember._id),
          ]);

          expect(updatedLeader.achievements.quests[party.quest.key]).to.eql(1);
          expect(updatedLeader.stats.exp).to.be.greaterThan(0);
          expect(updatedLeader.stats.gp).to.be.greaterThan(0);
          expect(updatedParticipatingMember.achievements.quests[party.quest.key]).to.eql(1);
          expect(updatedParticipatingMember.stats.exp).to.be.greaterThan(0);
          expect(updatedParticipatingMember.stats.gp).to.be.greaterThan(0);
        });
      });
    });

    describe('validateInvitations', () => {
      let res;

      beforeEach(() => {
        res = {
          t: sandbox.spy(),
        };
      });

      it('throws an error if no uuids or emails are passed in', async () => {
        await expect(Group.validateInvitations(null, null, res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('canOnlyInviteEmailUuid');
      });

      it('throws an error if only uuids are passed in, but they are not an array', async () => {
        await expect(Group.validateInvitations({ uuid: 'user-id'}, null, res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('uuidsMustBeAnArray');
      });

      it('throws an error if only emails are passed in, but they are not an array', async () => {
        await expect(Group.validateInvitations(null, { emails: 'user@example.com'}, res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('emailsMustBeAnArray');
      });

      it('throws an error if emails are not passed in, and uuid array is empty', async () => {
        await expect(Group.validateInvitations([], null, res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('inviteMissingUuid');
      });

      it('throws an error if uuids are not passed in, and email array is empty', async () => {
        await expect(Group.validateInvitations(null, [], res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('inviteMissingEmail');
      });

      it('throws an error if uuids and emails are passed in as empty arrays', async () => {
        await expect(Group.validateInvitations([], [], res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('inviteMustNotBeEmpty');
      });

      it('throws an error if total invites exceed max invite constant', async () => {
        let uuids = [];
        let emails = [];

        for (let i = 0; i < INVITES_LIMIT / 2; i++) {
          uuids.push(`user-id-${i}`);
          emails.push(`user-${i}@example.com`);
        }

        uuids.push('one-more-uuid'); // to put it over the limit

        await expect(Group.validateInvitations(uuids, emails, res)).to.eventually.be.rejected.and.eql({
          httpCode: 400,
          message: 'Bad request.',
          name: 'BadRequest',
        });
        expect(res.t).to.be.calledOnce;
        expect(res.t).to.be.calledWith('canOnlyInviteMaxInvites', {maxInvites: INVITES_LIMIT });
      });

      it('does not throw error if number of invites matches max invite limit', async () => {
        let uuids = [];
        let emails = [];

        for (let i = 0; i < INVITES_LIMIT / 2; i++) {
          uuids.push(`user-id-${i}`);
          emails.push(`user-${i}@example.com`);
        }

        await Group.validateInvitations(uuids, emails, res);
        expect(res.t).to.not.be.called;
      });


      it('does not throw an error if only user ids are passed in', async () => {
        await Group.validateInvitations(['user-id', 'user-id2'], null, res);
        expect(res.t).to.not.be.called;
      });

      it('does not throw an error if only emails are passed in', async () => {
        await Group.validateInvitations(null, ['user1@example.com', 'user2@example.com'], res);
        expect(res.t).to.not.be.called;
      });

      it('does not throw an error if both uuids and emails are passed in', async () => {
        await Group.validateInvitations(['user-id', 'user-id2'], ['user1@example.com', 'user2@example.com'], res);
        expect(res.t).to.not.be.called;
      });

      it('does not throw an error if uuids are passed in and emails are an empty array', async () => {
        await Group.validateInvitations(['user-id', 'user-id2'], [], res);
        expect(res.t).to.not.be.called;
      });

      it('does not throw an error if emails are passed in and uuids are an empty array', async () => {
        await Group.validateInvitations([], ['user1@example.com', 'user2@example.com'], res);
        expect(res.t).to.not.be.called;
      });
    });
  });

  context('Instance Methods', () => {
    describe('#getParticipatingQuestMembers', () => {
      it('returns an array of members whose quest status set to true', () => {
        party.quest.members = {
          [participatingMember._id]: true,
          [questLeader._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };

        expect(party.getParticipatingQuestMembers()).to.eql([
          participatingMember._id,
          questLeader._id,
        ]);
      });
    });

    describe('#checkChatSpam', () => {
      let testUser, testTime, tavern;
      let testUserID = '1';
      beforeEach(async () => {
        testTime = Date.now();

        tavern = new Group({
          name: 'test tavern',
          type: 'guild',
          privacy: 'public',
        });
        tavern._id = TAVERN_ID;

        testUser = {
          _id: testUserID,
        };
      });

      function generateTestMessage (overrides = {}) {
        return Object.assign({}, {
          text: 'test message',
          uuid: testUserID,
          timestamp: testTime,
        }, overrides);
      }

      it('group that is not the tavern returns false, while tavern returns true', async () => {
        for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
          party.chat.push(generateTestMessage());
        }
        expect(party.checkChatSpam(testUser)).to.eql(false);

        for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
          tavern.chat.push(generateTestMessage());
        }
        expect(tavern.checkChatSpam(testUser)).to.eql(true);
      });

      it('high enough contributor returns false', async () => {
        let highContributor = testUser;
        highContributor.contributor = {
          level: SPAM_MIN_EXEMPT_CONTRIB_LEVEL,
        };

        for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
          tavern.chat.push(generateTestMessage());
        }

        expect(tavern.checkChatSpam(highContributor)).to.eql(false);
      });

      it('chat with no messages returns false', async () => {
        expect(tavern.chat.length).to.eql(0);
        expect(tavern.checkChatSpam(testUser)).to.eql(false);
      });

      it('user has not reached limit but another one has returns false', async () => {
        let otherUserID = '2';

        for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
          tavern.chat.push(generateTestMessage({uuid: otherUserID}));
        }

        expect(tavern.checkChatSpam(testUser)).to.eql(false);
      });

      it('user messages is less than the limit returns false', async () => {
        for (let i = 0; i < SPAM_MESSAGE_LIMIT - 1; i++) {
          tavern.chat.push(generateTestMessage());
        }

        expect(tavern.checkChatSpam(testUser)).to.eql(false);
      });

      it('user has reached the message limit outside of window returns false', async () => {
        for (let i = 0; i < SPAM_MESSAGE_LIMIT - 1; i++) {
          tavern.chat.push(generateTestMessage());
        }
        let earlierTimestamp = testTime - SPAM_WINDOW_LENGTH - 1;
        tavern.chat.push(generateTestMessage({timestamp: earlierTimestamp}));

        expect(tavern.checkChatSpam(testUser)).to.eql(false);
      });

      it('user has posted too many messages in limit returns true', async () => {
        for (let i = 0; i < SPAM_MESSAGE_LIMIT; i++) {
          tavern.chat.push(generateTestMessage());
        }

        expect(tavern.checkChatSpam(testUser)).to.eql(true);
      });
    });

    describe('#leaveGroup', () => {
      it('removes user from group quest', async () => {
        party.quest.members = {
          [participatingMember._id]: true,
          [questLeader._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };
        party.memberCount = 4;
        await party.save();

        await party.leave(participatingMember);

        party = await Group.findOne({_id: party._id});
        expect(party.quest.members).to.eql({
          [questLeader._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        });
      });

      it('deletes a private party when the last member leaves', async () => {
        await party.leave(participatingMember);
        await party.leave(questLeader);
        await party.leave(nonParticipatingMember);
        await party.leave(undecidedMember);

        party = await Group.findOne({_id: party._id});
        expect(party).to.not.exist;
      });

      it('does not delete a private group when the last member leaves and a subscription is active', async () => {
        party.memberCount = 1;
        party.purchased.plan.customerId = '110002222333';

        await expect(party.leave(participatingMember))
          .to.eventually.be.rejected.and.to.eql({
            name: 'NotAuthorized',
            httpCode: 401,
            message: shared.i18n.t('cannotDeleteActiveGroup'),
          });

        party = await Group.findOne({_id: party._id});
        expect(party).to.exist;
        expect(party.memberCount).to.eql(1);
      });

      it('does not allow a leader to leave a group with an active subscription', async () => {
        party.memberCount = 2;
        party.purchased.plan.customerId = '110002222333';

        await expect(party.leave(questLeader))
          .to.eventually.be.rejected.and.to.eql({
            name: 'NotAuthorized',
            httpCode: 401,
            message: shared.i18n.t('leaderCannotLeaveGroupWithActiveGroup'),
          });

        party = await Group.findOne({_id: party._id});
        expect(party).to.exist;
        expect(party.memberCount).to.eql(1);
      });

      it('deletes a private group when the last member leaves and a subscription is cancelled', async () => {
        let guild = new Group({
          name: 'test guild',
          type: 'guild',
          memberCount: 1,
        });

        let leader = new User({
          guilds: [guild._id],
        });

        guild.leader = leader._id;

        await Promise.all([
          guild.save(),
          leader.save(),
        ]);

        guild.purchased.plan.customerId = '110002222333';
        guild.purchased.plan.dateTerminated = new Date();

        await guild.leave(leader);

        party = await Group.findOne({_id: guild._id});
        expect(party).to.not.exist;
      });

      it('does not delete a public group when the last member leaves', async () => {
        party.privacy = 'public';

        await party.leave(participatingMember);
        await party.leave(questLeader);
        await party.leave(nonParticipatingMember);
        await party.leave(undecidedMember);

        party = await Group.findOne({_id: party._id});
        expect(party).to.exist;
      });

      it('does not delete a private party when the member count reaches zero if there are still members', async () => {
        party.memberCount = 1;

        await party.leave(participatingMember);

        party = await Group.findOne({_id: party._id});
        expect(party).to.exist;
      });

      it('deletes a private guild when the last member leaves', async () => {
        let guild = new Group({
          name: 'test guild',
          type: 'guild',
          memberCount: 1,
        });

        let leader = new User({
          guilds: [guild._id],
        });

        guild.leader = leader._id;

        await Promise.all([
          guild.save(),
          leader.save(),
        ]);

        await guild.leave(leader);

        guild = await Group.findOne({_id: guild._id});
        expect(guild).to.not.exist;
      });

      it('does not delete a private guild when the member count reaches zero if there are still members', async () => {
        let guild = new Group({
          name: 'test guild',
          type: 'guild',
          memberCount: 1,
        });

        let leader = new User({
          guilds: [guild._id],
        });

        let member = new User({
          guilds: [guild._id],
        });

        guild.leader = leader._id;

        await Promise.all([
          guild.save(),
          leader.save(),
          member.save(),
        ]);

        await guild.leave(member);

        guild = await Group.findOne({_id: guild._id});
        expect(guild).to.exist;
      });
    });

    describe('#sendChat', () => {
      beforeEach(() => {
        sandbox.spy(User, 'update');
      });

      it('puts message at top of chat array', () => {
        let oldMessage = {
          text: 'a message',
        };
        party.chat.push(oldMessage, oldMessage, oldMessage);

        party.sendChat('a new message', {_id: 'user-id', profile: { name: 'user name' }});

        expect(party.chat).to.have.a.lengthOf(4);
        expect(party.chat[0].text).to.eql('a new message');
        expect(party.chat[0].uuid).to.eql('user-id');
      });

      it('formats message', () => {
        party.sendChat('a new message', {
          _id: 'user-id',
          profile: { name: 'user name' },
          contributor: {
            toObject () {
              return 'contributor object';
            },
          },
          backer: {
            toObject () {
              return 'backer object';
            },
          },
        });

        let chat = party.chat[0];

        expect(chat.text).to.eql('a new message');
        expect(validator.isUUID(chat.id)).to.eql(true);
        expect(chat.timestamp).to.be.a('number');
        expect(chat.likes).to.eql({});
        expect(chat.flags).to.eql({});
        expect(chat.flagCount).to.eql(0);
        expect(chat.uuid).to.eql('user-id');
        expect(chat.contributor).to.eql('contributor object');
        expect(chat.backer).to.eql('backer object');
        expect(chat.user).to.eql('user name');
      });

      it('formats message as system if no user is passed in', () => {
        party.sendChat('a system message');

        let chat = party.chat[0];

        expect(chat.text).to.eql('a system message');
        expect(validator.isUUID(chat.id)).to.eql(true);
        expect(chat.timestamp).to.be.a('number');
        expect(chat.likes).to.eql({});
        expect(chat.flags).to.eql({});
        expect(chat.flagCount).to.eql(0);
        expect(chat.uuid).to.eql('system');
        expect(chat.contributor).to.not.exist;
        expect(chat.backer).to.not.exist;
        expect(chat.user).to.not.exist;
      });

      it('cuts down chat to 200 messages', () => {
        for (let i = 0; i < 220; i++) {
          party.chat.push({ text: 'a message' });
        }

        expect(party.chat).to.have.a.lengthOf(220);

        party.sendChat('message');

        expect(party.chat).to.have.a.lengthOf(200);
      });

      it('cuts down chat to 400 messages when group is subcribed', () => {
        party.purchased.plan.customerId = 'test-customer-id';

        for (let i = 0; i < 420; i++) {
          party.chat.push({ text: 'a message' });
        }

        expect(party.chat).to.have.a.lengthOf(420);

        party.sendChat('message');

        expect(party.chat).to.have.a.lengthOf(400);
      });

      it('updates users about new messages in party', () => {
        party.sendChat('message');

        expect(User.update).to.be.calledOnce;
        expect(User.update).to.be.calledWithMatch({
          'party._id': party._id,
          _id: { $ne: '' },
        }, {
          $set: {
            [`newMessages.${party._id}`]: {
              name: party.name,
              value: true,
            },
          },
        });
      });

      it('updates users about new messages in group', () => {
        let group = new Group({
          type: 'guild',
        });

        group.sendChat('message');

        expect(User.update).to.be.calledOnce;
        expect(User.update).to.be.calledWithMatch({
          guilds: group._id,
          _id: { $ne: '' },
        }, {
          $set: {
            [`newMessages.${group._id}`]: {
              name: group.name,
              value: true,
            },
          },
        });
      });

      it('does not send update to user that sent the message', () => {
        party.sendChat('message', {_id: 'user-id', profile: { name: 'user' }});

        expect(User.update).to.be.calledOnce;
        expect(User.update).to.be.calledWithMatch({
          'party._id': party._id,
          _id: { $ne: 'user-id' },
        }, {
          $set: {
            [`newMessages.${party._id}`]: {
              name: party.name,
              value: true,
            },
          },
        });
      });

      it('skips sending new message notification for guilds with > 5000 members', () => {
        party.memberCount = 5001;

        party.sendChat('message');

        expect(User.update).to.not.be.called;
      });

      it('skips sending messages to the tavern', () => {
        party._id = TAVERN_ID;

        party.sendChat('message');

        expect(User.update).to.not.be.called;
      });
    });

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
          expect(participatingMember.party.quest.progress.collectedItems).to.eql(0);
          expect(participatingMember.party.quest.completed).to.eql(null);
        });

        it('applies updates to other participating members', async () => {
          await party.startQuest(nonParticipatingMember);

          questLeader = await User.findById(questLeader._id);
          participatingMember = await User.findById(participatingMember._id);

          expect(participatingMember.party.quest.key).to.eql('whale');
          expect(participatingMember.party.quest.progress.down).to.eql(0);
          expect(participatingMember.party.quest.progress.collectedItems).to.eql(0);
          expect(participatingMember.party.quest.completed).to.eql(null);

          expect(questLeader.party.quest.key).to.eql('whale');
          expect(questLeader.party.quest.progress.down).to.eql(0);
          expect(questLeader.party.quest.progress.collectedItems).to.eql(0);
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

          let memberIds = _.map(email.sendTxn.args[0][0], '_id');
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

          let memberIds = _.map(email.sendTxn.args[0][0], '_id');

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

          let memberIds = _.map(email.sendTxn.args[0][0], '_id');

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
          expect(userQuest.progress.collectedItems).to.eql(0);
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

    describe('#finishQuest', () => {
      let quest;

      beforeEach(() => {
        quest = questScrolls.whale;
        party.quest.key = quest.key;
        party.quest.active = false;
        party.quest.leader = questLeader._id;
        party.quest.members = {
          [questLeader._id]: true,
          [participatingMember._id]: true,
          [nonParticipatingMember._id]: false,
          [undecidedMember._id]: null,
        };
      });

      describe('user update retry failures', () => {
        let successfulMock = {
          exec: () => {
            return Promise.resolve({raw: 'sucess'});
          },
        };
        let failedMock = {
          exec: () => {
            return Promise.reject(new Error('error'));
          },
        };

        it('doesn\'t retry successful operations', async () => {
          sandbox.stub(User, 'update').returns(successfulMock);

          await party.finishQuest(quest);

          expect(User.update).to.be.calledTwice;
        });

        it('stops retrying when a successful update has occurred', async () => {
          let updateStub = sandbox.stub(User, 'update');
          updateStub.onCall(0).returns(failedMock);
          updateStub.returns(successfulMock);

          await party.finishQuest(quest);

          expect(User.update).to.be.calledThrice;
        });

        it('retries failed updates at most five times per user', async () => {
          sandbox.stub(User, 'update').returns(failedMock);

          await expect(party.finishQuest(quest)).to.eventually.be.rejected;

          expect(User.update.callCount).to.eql(10);
        });
      });

      it('gives out achievements', async () => {
        await party.finishQuest(quest);

        let [
          updatedLeader,
          updatedParticipatingMember,
        ] = await Promise.all([
          User.findById(questLeader._id),
          User.findById(participatingMember._id),
        ]);

        expect(updatedLeader.achievements.quests[quest.key]).to.eql(1);
        expect(updatedParticipatingMember.achievements.quests[quest.key]).to.eql(1);
      });

      it('gives out super awesome Masterclasser achievement to the deserving', async () => {
        quest = questScrolls.lostMasterclasser4;
        party.quest.key = quest.key;

        questLeader.achievements.quests = {
          mayhemMistiflying1: 1,
          mayhemMistiflying2: 1,
          mayhemMistiflying3: 1,
          stoikalmCalamity1: 1,
          stoikalmCalamity2: 1,
          stoikalmCalamity3: 1,
          taskwoodsTerror1: 1,
          taskwoodsTerror2: 1,
          taskwoodsTerror3: 1,
          dilatoryDistress1: 1,
          dilatoryDistress2: 1,
          dilatoryDistress3: 1,
          lostMasterclasser1: 1,
          lostMasterclasser2: 1,
          lostMasterclasser3: 1,
        };
        await questLeader.save();
        await party.finishQuest(quest);

        let [
          updatedLeader,
          updatedParticipatingMember,
        ] = await Promise.all([
          User.findById(questLeader._id),
          User.findById(participatingMember._id),
        ]);

        expect(updatedLeader.achievements.lostMasterclasser).to.eql(true);
        expect(updatedParticipatingMember.achievements.lostMasterclasser).to.not.eql(true);
      });

      it('gives xp and gold', async () => {
        await party.finishQuest(quest);

        let [
          updatedLeader,
          updatedParticipatingMember,
        ] = await Promise.all([
          User.findById(questLeader._id),
          User.findById(participatingMember._id),
        ]);

        expect(updatedLeader.stats.exp).to.eql(quest.drop.exp);
        expect(updatedLeader.stats.gp).to.eql(quest.drop.gp);
        expect(updatedParticipatingMember.stats.exp).to.eql(quest.drop.exp);
        expect(updatedParticipatingMember.stats.gp).to.eql(quest.drop.gp);
      });

      context('drops', () => {
        it('awards gear', async () => {
          let gearQuest = questScrolls.vice3;

          await party.finishQuest(gearQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.gear.owned.weapon_special_2).to.eql(true);
        });

        it('awards eggs', async () => {
          let eggQuest = questScrolls.vice3;

          await party.finishQuest(eggQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.eggs.Dragon).to.eql(2);
        });

        it('awards food', async () => {
          let foodQuest = questScrolls.moonstone3;

          await party.finishQuest(foodQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.food.RottenMeat).to.eql(5);
        });

        it('awards hatching potions', async () => {
          let hatchingPotionQuest = questScrolls.vice3;

          await party.finishQuest(hatchingPotionQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.hatchingPotions.Shade).to.eql(2);
        });

        it('awards quest scrolls to owner', async () => {
          let questAwardQuest = questScrolls.vice2;

          await party.finishQuest(questAwardQuest);

          let updatedLeader = await User.findById(questLeader._id);

          expect(updatedLeader.items.quests.vice3).to.eql(1);
        });

        it('awards non quest leader rewards to quest leader', async () => {
          let gearQuest = questScrolls.vice3;

          await party.finishQuest(gearQuest);

          let updatedLeader = await User.findById(questLeader._id);

          expect(updatedLeader.items.gear.owned.weapon_special_2).to.eql(true);
        });

        it('doesn\'t award quest owner rewards to all participants', async () => {
          let questAwardQuest = questScrolls.vice2;

          await party.finishQuest(questAwardQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.quests.vice3).to.not.exist;
        });

        it('awards pets', async () => {
          let petQuest = questScrolls.evilsanta2;

          await party.finishQuest(petQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.pets['BearCub-Polar']).to.eql(5);
        });

        it('awards mounts', async () => {
          let mountQuest = questScrolls.evilsanta;

          await party.finishQuest(mountQuest);

          let updatedParticipatingMember = await User.findById(participatingMember._id);

          expect(updatedParticipatingMember.items.mounts['BearCub-Polar']).to.eql(true);
        });
      });

      context('Party quests', () => {
        it('updates participating members with rewards', async () => {
          sandbox.spy(User, 'update');
          await party.finishQuest(quest);

          expect(User.update).to.be.calledTwice;
          expect(User.update).to.be.calledWithMatch({
            _id: questLeader._id,
          });
          expect(User.update).to.be.calledWithMatch({
            _id: participatingMember._id,
          });
        });

        it('sets user quest object to a clean state', async () => {
          await party.finishQuest(quest);

          let updatedLeader = await User.findById(questLeader._id);

          expect(updatedLeader.party.quest.completed).to.eql('whale');
          expect(updatedLeader.party.quest.progress.up).to.eql(0);
          expect(updatedLeader.party.quest.progress.down).to.eql(0);
          expect(updatedLeader.party.quest.progress.collectedItems).to.eql(0);
          expect(updatedLeader.party.quest.RSVPNeeded).to.eql(false);
        });
      });

      context('World quests in Tavern', () => {
        let tavernQuest;

        beforeEach(() => {
          party._id = TAVERN_ID;
          party.quest.key = 'stressbeast';
          tavernQuest = questScrolls.stressbeast;
        });

        it('updates all users with rewards', async () => {
          sandbox.spy(User, 'update');
          await party.finishQuest(tavernQuest);

          expect(User.update).to.be.calledOnce;
          expect(User.update).to.be.calledWithMatch({});
        });

        it('sets quest completed to the world quest key', async () => {
          await party.finishQuest(tavernQuest);

          let updatedLeader = await User.findById(questLeader._id);

          expect(updatedLeader.party.quest.completed).to.eql(tavernQuest.key);
        });
      });
    });

    describe('sendGroupChatReceivedWebhooks', () => {
      beforeEach(() => {
        sandbox.stub(groupChatReceivedWebhook, 'send');
      });

      it('looks for users in specified guild with webhooks', () => {
        sandbox.spy(User, 'find');

        let guild = new Group({
          type: 'guild',
        });

        guild.sendGroupChatReceivedWebhooks({});

        expect(User.find).to.be.calledWith({
          webhooks: {
            $elemMatch: {
              type: 'groupChatReceived',
              'options.groupId': guild._id,
            },
          },
          guilds: guild._id,
        });
      });

      it('looks for users in specified party with webhooks', () => {
        sandbox.spy(User, 'find');

        party.sendGroupChatReceivedWebhooks({});

        expect(User.find).to.be.calledWith({
          webhooks: {
            $elemMatch: {
              type: 'groupChatReceived',
              'options.groupId': party._id,
            },
          },
          'party._id': party._id,
        });
      });

      it('sends webhooks for users with webhooks', async () => {
        let guild = new Group({
          name: 'some guild',
          type: 'guild',
        });

        let chat = {message: 'text'};
        let memberWithWebhook = new User({
          guilds: [guild._id],
          webhooks: [{
            type: 'groupChatReceived',
            url: 'http://someurl.com',
            options: {
              groupId: guild._id,
            },
          }],
        });
        let memberWithoutWebhook = new User({
          guilds: [guild._id],
        });
        let nonMemberWithWebhooks = new User({
          webhooks: [{
            type: 'groupChatReceived',
            url: 'http://a-different-url.com',
            options: {
              groupId: generateUUID(),
            },
          }],
        });

        await Promise.all([
          memberWithWebhook.save(),
          memberWithoutWebhook.save(),
          nonMemberWithWebhooks.save(),
        ]);

        guild.leader = memberWithWebhook._id;

        await guild.save();

        guild.sendGroupChatReceivedWebhooks(chat);

        await sleep();

        expect(groupChatReceivedWebhook.send).to.be.calledOnce;

        let args = groupChatReceivedWebhook.send.args[0];
        let webhooks = args[0];
        let options = args[1];

        expect(webhooks).to.have.a.lengthOf(1);
        expect(webhooks[0].id).to.eql(memberWithWebhook.webhooks[0].id);
        expect(options.group).to.eql(guild);
        expect(options.chat).to.eql(chat);
      });

      it('sends webhooks for each user with webhooks in group', async () => {
        let guild = new Group({
          name: 'some guild',
          type: 'guild',
        });

        let chat = {message: 'text'};
        let memberWithWebhook = new User({
          guilds: [guild._id],
          webhooks: [{
            type: 'groupChatReceived',
            url: 'http://someurl.com',
            options: {
              groupId: guild._id,
            },
          }],
        });
        let memberWithWebhook2 = new User({
          guilds: [guild._id],
          webhooks: [{
            type: 'groupChatReceived',
            url: 'http://another-member.com',
            options: {
              groupId: guild._id,
            },
          }],
        });
        let memberWithWebhook3 = new User({
          guilds: [guild._id],
          webhooks: [{
            type: 'groupChatReceived',
            url: 'http://a-third-member.com',
            options: {
              groupId: guild._id,
            },
          }],
        });

        await Promise.all([
          memberWithWebhook.save(),
          memberWithWebhook2.save(),
          memberWithWebhook3.save(),
        ]);

        guild.leader = memberWithWebhook._id;

        await guild.save();

        guild.sendGroupChatReceivedWebhooks(chat);

        await sleep();

        expect(groupChatReceivedWebhook.send).to.be.calledThrice;

        let args = groupChatReceivedWebhook.send.args;
        expect(args.find(arg => arg[0][0].id === memberWithWebhook.webhooks[0].id)).to.be.exist;
        expect(args.find(arg => arg[0][0].id === memberWithWebhook2.webhooks[0].id)).to.be.exist;
        expect(args.find(arg => arg[0][0].id === memberWithWebhook3.webhooks[0].id)).to.be.exist;
      });
    });

    context('isSubscribed', () => {
      it('returns false if group does not have customer id', () => {
        expect(party.isSubscribed()).to.be.undefined;
      });

      it('returns true if group does not have plan.dateTerminated', () => {
        party.purchased.plan.customerId = 'test-id';

        expect(party.isSubscribed()).to.be.true;
      });

      it('returns true if group if plan.dateTerminated is after today', () => {
        party.purchased.plan.customerId = 'test-id';
        party.purchased.plan.dateTerminated = moment().add(1, 'days').toDate();

        expect(party.isSubscribed()).to.be.true;
      });

      it('returns false if group if plan.dateTerminated is before today', () => {
        party.purchased.plan.customerId = 'test-id';
        party.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();

        expect(party.isSubscribed()).to.be.false;
      });
    });

    context('hasNotCancelled', () => {
      it('returns false if group does not have customer id', () => {
        expect(party.hasNotCancelled()).to.be.undefined;
      });

      it('returns true if party does not have plan.dateTerminated', () => {
        party.purchased.plan.customerId = 'test-id';

        expect(party.hasNotCancelled()).to.be.true;
      });

      it('returns false if party if plan.dateTerminated is after today', () => {
        party.purchased.plan.customerId = 'test-id';
        party.purchased.plan.dateTerminated = moment().add(1, 'days').toDate();

        expect(party.hasNotCancelled()).to.be.false;
      });

      it('returns false if party if plan.dateTerminated is before today', () => {
        party.purchased.plan.customerId = 'test-id';
        party.purchased.plan.dateTerminated = moment().subtract(1, 'days').toDate();

        expect(party.hasNotCancelled()).to.be.false;
      });
    });
  });
});
