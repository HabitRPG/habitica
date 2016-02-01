import { model as Group } from '../../../../../website/src/models/group';
import { model as User } from '../../../../../website/src/models/user';
import { quests as questScrolls } from '../../../../../common/script/content';

describe('Group Model', () => {
  context('Instance Methods', () => {
    let party;

    beforeEach(() => {
      party = new Group({
        type: 'party',
      });
    });

    describe('#startQuest', () => {
      context('Failure Conditions', () => {
        it('throws an error if group is not a party', () => {
          let guild = new Group({
            type: 'guild',
          });

          expect(() => {
            guild.startQuest();
          }).to.throw('Must be a party to use this method');
        });

        it('throws an error if party is not on a quest', () => {
          expect(() => {
            party.startQuest();
          }).to.throw('Party does not have a pending quest');
        });

        it('throws an error if quest is already active', () => {
          party.quest.key = 'whale';
          party.quest.active = true;

          expect(() => {
            party.startQuest();
          }).to.throw('Quest is already active');
        });
      });

      context('Successes', () => {
        beforeEach(() => {
          party.quest.key = 'whale';
          party.quest.active = false;
          party.quest.leader = 'quest-leader';
          party.quest.members = {
            'quest-leader': true,
            'participating-member': true,
            'non-participating-member': false,
            'undecided-member': null,
          };

          sandbox.stub(User, 'update').returns({ exec: sandbox.spy() });
        });

        it('activates quest', () => {
          party.startQuest();

          expect(party.quest.active).to.eql(true);
        });

        it('sets up boss quest', () => {
          let bossQuest = questScrolls.whale;
          party.quest.key = bossQuest.key;

          party.startQuest();

          expect(party.quest.progress.hp).to.eql(bossQuest.boss.hp);
        });

        it('sets up rage meter for rage boss quest', () => {
          let rageBossQuest = questScrolls.trex_undead;
          party.quest.key = rageBossQuest.key;

          party.startQuest();

          expect(party.quest.progress.rage).to.eql(0);
        });

        it('sets up collection quest', () => {
          let collectionQuest = questScrolls.vice2;
          party.quest.key = collectionQuest.key;
          party.startQuest();

          expect(party.quest.progress.collect).to.eql({
            lightCrystal: 0,
          });
        });

        it('sets up collection quest with multiple items', () => {
          let collectionQuest = questScrolls.evilsanta2;
          party.quest.key = collectionQuest.key;
          party.startQuest();

          expect(party.quest.progress.collect).to.eql({
            tracks: 0,
            branches: 0,
          });
        });

        it('updates quest object for participating members', () => {
          party.startQuest();

          expect(User.update).to.be.calledTwice;
          expect(User.update).to.not.be.calledWith({ _id: 'non-participating-member' });
          expect(User.update).to.not.be.calledWith({ _id: 'undecided-member' });
          expect(User.update).to.be.calledWith(
            { _id: 'participating-member' },
            sinon.match({ $set: { 'party.quest.key': 'whale' }}),
          );
          expect(User.update).to.be.calledWith(
            { _id: 'quest-leader' },
            sinon.match({ $set: { 'party.quest.key': 'whale' }}),
          );
        });

        it('removes quest scroll from quest leader', () => {
          party.startQuest();

          expect(User.update).to.be.calledWith(
            { _id: 'quest-leader' },
            sinon.match({ $inc: { 'items.quests.whale': -1 }}),
          );
        });

        it('sends email to participating members that quest has started');

        it('sends email only to members who have not opted out');
      });
    });
  });
});
