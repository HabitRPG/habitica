// TODO These tests are pretty brittle
// rewrite them to not depend on nock
// Trust that the amplitude module works as intended and sends the requests
import analyticsService from '../../../../../website/server/libs/analyticsService';

import nock from 'nock';

describe('analyticsService', () => {
  let amplitudeNock, gaNock;

  beforeEach(() => {
    amplitudeNock = nock('https://api.amplitude.com')
      .filteringPath(/httpapi.*/g, '')
      .post('/')
      .reply(200, {status: 'OK'});

    gaNock = nock('http://www.google-analytics.com');
  });

  describe('#track', () => {
    let eventType, data;

    beforeEach(() => {
      eventType = 'Cron';
      data = {
        category: 'behavior',
        uuid: 'unique-user-id',
        resting: true,
        cronCount: 5,
        headers: {'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => {
        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        amplitudeNock
          .filteringPath(/httpapi.*user_id.*no-user-id-was-provided.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      context('platform', () => {
        it('logs web platform', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*Web.*/g, '');

          data.headers = {'x-client': 'habitica-web'};

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('logs iOS platform', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*iOS.*/g, '');

          data.headers = {'x-client': 'habitica-ios'};

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('logs Android platform', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*Android.*/g, '');

          data.headers = {'x-client': 'habitica-android'};

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('logs 3rd Party platform', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*3rd\%20Party.*/g, '');

          data.headers = {'x-client': 'some-third-party'};

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('logs unknown if headers are not passed in', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*Unknown.*/g, '');

          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });
      });

      context('Operating System', () => {
        it('sets default', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*Other.*/g, '');

          data.headers = {
            'x-client': 'thrid-party',
            'user-agent': 'foo',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('sets iOS', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*iOS.*/g, '');

          data.headers = {
            'x-client': 'habitica-ios',
            'user-agent': 'Habitica/148 (iPhone; iOS 9.3; Scale/2.00)',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('sets Android', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*Android.*/g, '');

          data.headers = {
            'x-client': 'habitica-android',
            'user-agent': 'Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19',
          };

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('sets Unkown if headers are not passed in', () => {
          amplitudeNock
            .filteringPath(/httpapi.*Unknown.*/g, '');

          delete data.headers;

          return analyticsService.track(eventType, data)
            .then(() => {
              amplitudeNock.done();
            });
        });
      });

      it('sends details about event', () => {
        amplitudeNock
          .filteringPath(/httpapi.*event_properties%22%3A%7B%22category%22%3A%22behavior%22%2C%22resting%22%3Atrue%2C%22cronCount%22%3A5%7D%2C%22.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('sends english item name for gear if itemKey is provided', () => {
        data.itemKey = 'headAccessory_special_foxEars';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Fox%20Ears.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('sends english item name for egg if itemKey is provided', () => {
        data.itemKey = 'Wolf';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Wolf%20Egg.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('sends english item name for food if itemKey is provided', () => {
        data.itemKey = 'Cake_Skeleton';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Bare%20Bones%20Cake.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('sends english item name for hatching potion if itemKey is provided', () => {
        data.itemKey = 'Golden';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Golden%20Hatching%20Potion.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      xit('sends english item name for quest if itemKey is provided', () => {
        data.itemKey = 'atom1';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Attack%20of%20the%20Mundane%2C%20Part%201%3A%20Dish%20Disaster!.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('sends english item name for purchased spell if itemKey is provided', () => {
        data.itemKey = 'seafoam';

        amplitudeNock
          .filteringPath(/httpapi.*itemName.*Seafoam.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
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

        amplitudeNock
          .filteringPath(/httpapi.*user_properties%22%3A%7B%22Class%22%3A%22wizard%22%2C%22Experience%22%3A5%2C%22Gold%22%3A23%2C%22Health%22%3A10%2C%22Level%22%3A4%2C%22Mana%22%3A30%2C%22tutorialComplete%22%3Atrue%2C%22Number%20Of%20Tasks%22%3A%7B%22habits%22%3A1%2C%22dailys%22%3A1%2C%22todos%22%3A1%2C%22rewards%22%3A1%7D%2C%22contributorLevel%22%3A1%2C%22subscription%22%3A%22foo-plan%22%7D%2C%22.*/g, '');

        return analyticsService.track(eventType, data)
          .then(() => {
            amplitudeNock.done();
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => {
        gaNock
          .post('/collect')
          .reply(200, {status: 'OK'});

        return analyticsService.track(eventType, data)
          .then(() => {
            gaNock.done();
          });
      });

      it('sends details about event', () => {
        gaNock
          .post('/collect', /ec=behavior&ea=Cron&v=1&tid=GA_ID&cid=.*&t=event/)
          .reply(200, {status: 'OK'});

        return analyticsService.track(eventType, data)
          .then(() => {
            gaNock.done();
          });
      });
    });
  });

  describe('#trackPurchase', () => {
    let data;

    beforeEach(() => {
      data = {
        uuid: 'user-id',
        sku: 'paypal-checkout',
        paymentMethod: 'PayPal',
        itemPurchased: 'Gems',
        purchaseValue: 8,
        purchaseType: 'checkout',
        gift: false,
        quantity: 1,
        headers: {'x-client': 'habitica-web',
          'user-agent': '',
        },
      };
    });

    context('Amplitude', () => {
      it('calls out to amplitude', () => {
        return analyticsService.trackPurchase(data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      it('uses a dummy user id if none is provided', () => {
        delete data.uuid;

        amplitudeNock
          .filteringPath(/httpapi.*user_id.*no-user-id-was-provided.*/g, '');

        return analyticsService.trackPurchase(data)
          .then(() => {
            amplitudeNock.done();
          });
      });

      context('sets platform as', () => {
        it('Web', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*Web.*/g, '');

          data.headers = {'x-client': 'habitica-web'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('iOS', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*iOS.*/g, '');

          data.headers = {'x-client': 'habitica-ios'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('Android', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*Android.*/g, '');

          data.headers = {'x-client': 'habitica-android'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('3rd Party', () => {
          amplitudeNock
            .filteringPath(/httpapi.*platform.*3rd\%20Party.*/g, '');

          data.headers = {};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });
      });

      context('sets os for', () => {
        it('Default', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*Other.*/g, '');

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('iOS', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*iOS.*/g, '');

          data.headers = {'x-client': 'habitica-ios',
            'user-agent': 'Habitica/148 (iPhone; iOS 9.3; Scale/2.00)'};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });

        it('Android', () => {
          amplitudeNock
            .filteringPath(/httpapi.*os.*name.*Android.*/g, '');

          data.headers = {'x-client': 'habitica-android',
            'user-agent': ''};

          return analyticsService.trackPurchase(data)
            .then(() => {
              amplitudeNock.done();
            });
        });
      });

      it('sends details about purchase', () => {
        amplitudeNock
          .filteringPath(/httpapi.*aypal-checkout%22%2C%22paymentMethod%22%3A%22PayPal%22%2C%22itemPurchased%22%3A%22Gems%22%2C%22purchaseType%22%3A%22checkout%22%2C%22gift%22%3Afalse%2C%22quantity%22%3A1%7D%2C%22event_type%22%3A%22purchase%22%2C%22revenue.*/g, '');

        return analyticsService.trackPurchase(data)
          .then(() => {
            amplitudeNock.done();
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

        amplitudeNock
          .filteringPath(/httpapi.*user_properties%22%3A%7B%22Class%22%3A%22wizard%22%2C%22Experience%22%3A5%2C%22Gold%22%3A23%2C%22Health%22%3A10%2C%22Level%22%3A4%2C%22Mana%22%3A30%2C%22tutorialComplete%22%3Atrue%2C%22Number%20Of%20Tasks%22%3A%7B%22habits%22%3A1%2C%22dailys%22%3A1%2C%22todos%22%3A1%2C%22rewards%22%3A1%7D%2C%22contributorLevel%22%3A1%2C%22subscription%22%3A%22foo-plan%22%7D%2C%22.*/g, '');

        return analyticsService.trackPurchase(data)
          .then(() => {
            amplitudeNock.done();
          });
      });
    });

    context('GA', () => {
      it('calls out to GA', () => {
        gaNock
          .post('/collect')
          .reply(200, {status: 'OK'});

        return analyticsService.trackPurchase(data)
          .then(() => {
            gaNock.done();
          });
      });

      it('sends details about purchase', () => {
        gaNock
          .post('/collect', /ti=user-id&tr=8&v=1&tid=GA_ID&cid=.*&t=transaction/)
          .reply(200, {status: 'OK'})
          .post('/collect', /ec=commerce&ea=checkout&el=PayPal&ev=8&v=1&tid=GA_ID&cid=.*&t=event/)
          .reply(200, {status: 'OK'});

        return analyticsService.trackPurchase(data)
          .then(() => {
            gaNock.done();
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
