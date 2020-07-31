import { v4 as generateUUID } from 'uuid';
import { model as Webhook } from '../../../../website/server/models/webhook';
import { BadRequest } from '../../../../website/server/libs/errors';
import apiError from '../../../../website/server/libs/apiError';

describe('Webhook Model', () => {
  context('Instance Methods', () => {
    describe('#formatOptions', () => {
      let res;

      beforeEach(() => {
        res = {
          t: sandbox.spy(),
        };
      });
      context('type is taskActivity', () => {
        let config;

        beforeEach(() => {
          config = {
            type: 'taskActivity',
            url: 'https//exmaple.com/endpoint',
            options: {
              created: true,
              updated: true,
              deleted: true,
              scored: true,
              checklistScored: true,
            },
          };
        });

        it('it provides default values for options', () => {
          delete config.options;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            checklistScored: false,
            created: false,
            updated: false,
            deleted: false,
            scored: true,
          });
        });

        it('provides missing task options', () => {
          delete config.options.created;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            checklistScored: true,
            created: false,
            updated: true,
            deleted: true,
            scored: true,
          });
        });

        it('discards additional options', () => {
          config.options.foo = 'another option';

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            checklistScored: true,
            created: true,
            updated: true,
            deleted: true,
            scored: true,
          });
        });

        ['created', 'updated', 'deleted', 'scored', 'checklistScored'].forEach(option => {
          it(`validates that ${option} is a boolean`, done => {
            config.options[option] = 'not a boolean';

            try {
              const wh = new Webhook(config);

              wh.formatOptions(res);
            } catch (err) {
              expect(err).to.be.an.instanceOf(BadRequest);
              expect(res.t).to.be.calledOnce;
              expect(res.t).to.be.calledWith('webhookBooleanOption', { option });
              done();
            }
          });
        });
      });

      context('type is userActivity', () => {
        let config;

        beforeEach(() => {
          config = {
            type: 'userActivity',
            url: 'https//exmaple.com/endpoint',
            options: {
              petHatched: true,
              mountRaised: true,
              leveledUp: true,
            },
          };
        });

        it('it provides default values for options', () => {
          delete config.options;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            petHatched: false,
            mountRaised: false,
            leveledUp: false,
          });
        });

        it('provides missing user options', () => {
          delete config.options.petHatched;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            petHatched: false,
            mountRaised: true,
            leveledUp: true,
          });
        });

        it('discards additional options', () => {
          config.options.foo = 'another option';

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            petHatched: true,
            mountRaised: true,
            leveledUp: true,
          });
        });

        ['petHatched', 'petHatched', 'leveledUp'].forEach(option => {
          it(`validates that ${option} is a boolean`, done => {
            config.options[option] = 'not a boolean';

            try {
              const wh = new Webhook(config);

              wh.formatOptions(res);
            } catch (err) {
              expect(err).to.be.an.instanceOf(BadRequest);
              expect(res.t).to.be.calledOnce;
              expect(res.t).to.be.calledWith('webhookBooleanOption', { option });
              done();
            }
          });
        });
      });

      context('type is questActivity', () => {
        let config;

        beforeEach(() => {
          config = {
            type: 'questActivity',
            url: 'https//exmaple.com/endpoint',
            options: {
              questStarted: true,
              questFinished: true,
              questInvited: true,
            },
          };
        });

        it('it provides default values for options', () => {
          delete config.options;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            questStarted: false,
            questFinished: false,
            questInvited: false,
          });
        });

        it('provides missing user options', () => {
          delete config.options.questStarted;

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            questStarted: false,
            questFinished: true,
            questInvited: true,
          });
        });

        it('discards additional options', () => {
          config.options.foo = 'another option';

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            questStarted: true,
            questFinished: true,
            questInvited: true,
          });
        });

        ['questStarted', 'questFinished'].forEach(option => {
          it(`validates that ${option} is a boolean`, done => {
            config.options[option] = 'not a boolean';

            try {
              const wh = new Webhook(config);

              wh.formatOptions(res);
            } catch (err) {
              expect(err).to.be.an.instanceOf(BadRequest);
              expect(res.t).to.be.calledOnce;
              expect(res.t).to.be.calledWith('webhookBooleanOption', { option });
              done();
            }
          });
        });
      });

      context('type is groupChatReceived', () => {
        let config;

        beforeEach(() => {
          config = {
            type: 'groupChatReceived',
            url: 'https//exmaple.com/endpoint',
            options: {
              groupId: generateUUID(),
            },
          };
        });

        it('creates options', () => {
          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql(config.options);
        });

        it('discards additional objects', () => {
          config.options.foo = 'another thing';

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            groupId: config.options.groupId,
          });
        });

        it('requires groupId option to be a uuid', done => {
          config.options.groupId = 'not a uuid';

          try {
            const wh = new Webhook(config);

            wh.formatOptions(res);
          } catch (err) {
            expect(err).to.be.an.instanceOf(BadRequest);

            expect(err.message).to.eql(apiError('groupIdRequired'));
            done();
          }
        });
      });

      context('type is globalActivity', () => {
        let config;

        beforeEach(() => {
          config = {
            type: 'globalActivity',
            url: 'https//exmaple.com/endpoint',
            options: { },
          };
        });

        it('discards additional objects', () => {
          config.options.foo = 'another thing';

          const wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({});
        });
      });
    });
  });
});
