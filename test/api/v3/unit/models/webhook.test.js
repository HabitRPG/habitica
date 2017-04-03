import { model as Webhook } from '../../../../../website/server/models/webhook';
import { BadRequest } from '../../../../../website/server/libs/errors';
import { v4 as generateUUID } from 'uuid';

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
            },
          };
        });

        it('it provides default values for options', () => {
          delete config.options;

          let wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            created: false,
            updated: false,
            deleted: false,
            scored: true,
          });
        });

        it('provides missing task options', () => {
          delete config.options.created;

          let wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql({
            created: false,
            updated: true,
            deleted: true,
            scored: true,
          });
        });

        it('discards additional options', () => {
          config.options.foo = 'another option';

          let wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            created: true,
            updated: true,
            deleted: true,
            scored: true,
          });
        });

        ['created', 'updated', 'deleted', 'scored'].forEach((option) => {
          it(`validates that ${option} is a boolean`, (done) => {
            config.options[option] = 'not a boolean';

            try {
              let wh = new Webhook(config);

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
          let wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options).to.eql(config.options);
        });

        it('discards additional objects', () => {
          config.options.foo = 'another thing';

          let wh = new Webhook(config);

          wh.formatOptions(res);

          expect(wh.options.foo).to.not.exist;
          expect(wh.options).to.eql({
            groupId: config.options.groupId,
          });
        });

        it('requires groupId option to be a uuid', (done) => {
          config.options.groupId = 'not a uuid';

          try {
            let wh = new Webhook(config);

            wh.formatOptions(res);
          } catch (err) {
            expect(err).to.be.an.instanceOf(BadRequest);
            expect(res.t).to.be.calledOnce;
            expect(res.t).to.be.calledWith('groupIdRequired');
            done();
          }
        });
      });
    });
  });
});
