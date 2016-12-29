/* eslint-disable camelcase */
import analyticsService from '../../../../../website/server/libs/analyticsService';
import Amplitude from 'amplitude';
import { Visitor } from 'universal-analytics';

describe('analyticsService', () => {
  beforeEach(() => {
    sandbox.stub(Amplitude.prototype, 'track').returns(Promise.resolve());

    sandbox.stub(Visitor.prototype, 'event');
    sandbox.stub(Visitor.prototype, 'transaction');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#track', () => {
    let eventType, data;

    beforeEach(() => {
      Visitor.prototype.event.yields();

      eventType = 'Cron';
      data = {
        category: 'behavior',
        uuid: 'unique-user-id',
        resting: true,
        cronCount: 5,
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => {
        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledOnce;
          });
      });

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_id: 'no-user-id-was-provided',
            });
          });
      });

      context('platform', () => {
        it('logs web platform', () => {
          data.headers = {'x-client': 'habitica-web'};

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Web',
              });
            });
        });

        it('logs iOS platform', () => {
          data.headers = {'x-client': 'habitica-ios'};

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'iOS',
              });
            });
        });

        it('logs Android platform', () => {
          data.headers = {'x-client': 'habitica-android'};

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Android',
              });
            });
        });

        it('logs 3rd Party platform', () => {
          data.headers = {'x-client': 'some-third-party'};

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: '3rd Party',
              });
            });
        });

        it('logs unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Unknown',
              });
            });
        });
      });

      context('Operating System', () => {
        it('sets default', () => {
          data.headers = {
            'x-client': 'third-party',
            'user-agent': 'foo',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Other',
                os_version: '0',
              });
            });
        });

        it('sets iOS', () => {
          data.headers = {
            'x-client': 'habitica-ios',
            'user-agent': 'Habitica/148 (iPhone; iOS 9.3; Scale/2.00)',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'iOS',
                os_version: '9.3.0',
              });
            });
        });

        it('sets Android', () => {
          data.headers = {
            'x-client': 'habitica-android',
            'user-agent': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Android',
                os_version: '4.0.4',
              });
            });
        });

        it('sets Unkown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: undefined,
                os_version: undefined,
              });
            });
        });
      });

      it('sends details about event', () => {
        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                category: 'behavior',
                resting: true,
                cronCount: 5,
              },
            });
          });
      });

      it('sends english item name for gear if itemKey is provided', () => {
        data.itemKey = 'headAccessory_special_foxEars';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Fox Ears',
              },
            });
          });
      });

      it('sends english item name for egg if itemKey is provided', () => {
        data.itemKey = 'Wolf';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Wolf Egg',
              },
            });
          });
      });

      it('sends english item name for food if itemKey is provided', () => {
        data.itemKey = 'Cake_Skeleton';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Bare Bones Cake',
              },
            });
          });
      });

      it('sends english item name for hatching potion if itemKey is provided', () => {
        data.itemKey = 'Golden';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Golden Hatching Potion',
              },
            });
          });
      });

      it('sends english item name for quest if itemKey is provided', () => {
        data.itemKey = 'atom1';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Attack of the Mundane, Part 1: Dish Disaster!',
              },
            });
          });
      });

      it('sends english item name for purchased spell if itemKey is provided', () => {
        data.itemKey = 'seafoam';

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                itemKey: data.itemKey,
                itemName: 'Seafoam',
              },
            });
          });
      });

      it('sends user data if provided', () => {
        let stats = { class: 'wizard', exp: 5, gp: 23, hp: 10, lvl: 4, mp: 30 };
        let user = {
          stats,
          contributor: { level: 1 },
          purchased: { plan: { planId: 'foo-plan' } },
          flags: {tour: {intro: -2}},
          habits: [{_id: 'habit'}],
          dailys: [{_id: 'daily'}],
          todos: [{_id: 'todo'}],
          rewards: [{_id: 'reward'}],
          balance: 12,
          loginIncentives: 1,
        };

        data.user = user;

        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_properties: {
                Class: 'wizard',
                Experience: 5,
                Gold: 23,
                Health: 10,
                Level: 4,
                Mana: 30,
                tutorialComplete: true,
                'Number Of Tasks': {
                  habits: 1,
                  dailys: 1,
                  todos: 1,
                  rewards: 1,
                },
                contributorLevel: 1,
                subscription: 'foo-plan',
                balance: 12,
                balanceGemAmount: 48,
                loginIncentives: 1,
              },
            });
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => {
        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Visitor.prototype.event).to.be.calledOnce;
          });
      });

      it('sends details about event', () => {
        return analyticsService.track(eventType, data)
          .then(() => {
            expect(Visitor.prototype.event).to.be.calledWith({
              ea: 'Cron',
              ec: 'behavior',
            });
          });
      });
    });
  });

  describe('#trackPurchase', () => {
    let data, itemSpy;

    beforeEach(() => {
      itemSpy = sandbox.stub().returnsThis();

      Visitor.prototype.event.returns({
        send: sandbox.stub(),
      });
      Visitor.prototype.transaction.returns({
        item: itemSpy,
        send: sandbox.stub().returnsThis(),
      });

      data = {
        uuid: 'user-id',
        sku: 'paypal-checkout',
        paymentMethod: 'PayPal',
        itemPurchased: 'Gems',
        purchaseValue: 8,
        purchaseType: 'checkout',
        gift: false,
        quantity: 1,
        headers: {
          'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => {
        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledOnce;
          });
      });

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_id: 'no-user-id-was-provided',
            });
          });
      });

      context('platform', () => {
        it('logs web platform', () => {
          data.headers = {'x-client': 'habitica-web'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Web',
              });
            });
        });

        it('logs iOS platform', () => {
          data.headers = {'x-client': 'habitica-ios'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'iOS',
              });
            });
        });

        it('logs Android platform', () => {
          data.headers = {'x-client': 'habitica-android'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Android',
              });
            });
        });

        it('logs 3rd Party platform', () => {
          data.headers = {'x-client': 'some-third-party'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: '3rd Party',
              });
            });
        });

        it('logs unknown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                platform: 'Unknown',
              });
            });
        });
      });

      context('Operating System', () => {
        it('sets default', () => {
          data.headers = {
            'x-client': 'third-party',
            'user-agent': 'foo',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Other',
                os_version: '0',
              });
            });
        });

        it('sets iOS', () => {
          data.headers = {
            'x-client': 'habitica-ios',
            'user-agent': 'Habitica/148 (iPhone; iOS 9.3; Scale/2.00)',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'iOS',
                os_version: '9.3.0',
              });
            });
        });

        it('sets Android', () => {
          data.headers = {
            'x-client': 'habitica-android',
            'user-agent': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
          };

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: 'Android',
                os_version: '4.0.4',
              });
            });
        });

        it('sets Unkown if headers are not passed in', () => {
          delete data.headers;

          return analyticsService.trackPurchase(data)
            .then(() => {
              expect(Amplitude.prototype.track).to.be.calledWithMatch({
                os_name: undefined,
                os_version: undefined,
              });
            });
        });
      });

      it('sends details about purchase', () => {
        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              event_properties: {
                gift: false,
                itemPurchased: 'Gems',
                paymentMethod: 'PayPal',
                purchaseType: 'checkout',
                quantity: 1,
                sku: 'paypal-checkout',
              },
            });
          });
      });

      it('sends user data if provided', () => {
        let stats = { class: 'wizard', exp: 5, gp: 23, hp: 10, lvl: 4, mp: 30 };
        let user = {
          stats,
          contributor: { level: 1 },
          purchased: { plan: { planId: 'foo-plan' } },
          flags: {tour: {intro: -2}},
          habits: [{_id: 'habit'}],
          dailys: [{_id: 'daily'}],
          todos: [{_id: 'todo'}],
          rewards: [{_id: 'reward'}],
        };

        data.user = user;

        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Amplitude.prototype.track).to.be.calledWithMatch({
              user_properties: {
                Class: 'wizard',
                Experience: 5,
                Gold: 23,
                Health: 10,
                Level: 4,
                Mana: 30,
                tutorialComplete: true,
                'Number Of Tasks': {
                  habits: 1,
                  dailys: 1,
                  todos: 1,
                  rewards: 1,
                },
                contributorLevel: 1,
                subscription: 'foo-plan',
              },
            });
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => {
        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Visitor.prototype.event).to.be.calledOnce;
            expect(Visitor.prototype.transaction).to.be.calledOnce;
          });
      });

      it('sends details about purchase', () => {
        return analyticsService.trackPurchase(data)
          .then(() => {
            expect(Visitor.prototype.event).to.be.calledWith({
              ea: 'checkout',
              ec: 'commerce',
              el: 'PayPal',
              ev: 8,
            });
            expect(Visitor.prototype.transaction).to.be.calledWith('user-id', 8);
            expect(itemSpy).to.be.calledWith(8, 1, 'paypal-checkout', 'Gems', 'checkout');
          });
      });
    });
  });

  describe('mockAnalyticsService', () => {
    it('has stubbed track method', () => {
      expect(analyticsService.mockAnalyticsService).to.respondTo('track');
    });

    it('has stubbed trackPurchase method', () => {
      expect(analyticsService.mockAnalyticsService).to.respondTo('trackPurchase');
    });
  });
});
