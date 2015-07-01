var sinon = require('sinon');
var chai = require("chai")
chai.use(require("sinon-chai"))
var expect = chai.expect
var rewire = require('rewire');

describe('analytics', function() {
  var amplitudeMock = sinon.stub();

  describe('init', function() {
    var analytics = rewire('../../website/src/analytics');

    beforeEach(function() {
      analytics.__set__('Amplitude', amplitudeMock);
    });

    afterEach(function(){
      amplitudeMock.reset();
    });

    it('throws an error if no options are passed in', function() {
      expect(analytics.init).to.throw('No options provided');
    });

    it('registers amplitude with token', function() {
      var options = {
        amplitudeToken: 'token',
        uuid: 'user-id'
      };
      analytics.init(options);

      expect(amplitudeMock).to.be.calledOnce;
      expect(amplitudeMock).to.be.calledWith('token', 'user-id');
    });

    it('does not register amplitude without token', function() {
      var options = { uuid: 'user-id' };
      analytics.init(options);

      expect(amplitudeMock).to.not.be.called;
    });
  });

  describe('track', function() {
    var analytics = rewire('../../website/src/analytics');

    context('amplitude not initialized', function() {
      it('throws error', function() {
        expect(analytics.track).to.throw('Amplitude not initialized');
      });
    });

    context('amplitude initialized', function() {
      var amplitudeTrack = sinon.stub();

      beforeEach(function() {
        analytics.__set__('Amplitude', amplitudeMock);
        analytics.init({amplitudeToken: 'token', uuid: 'user-id'});
        analytics.__set__('amplitude.track', amplitudeTrack);
      });

      afterEach(function(){
        amplitudeMock.reset();
      });

      it('tracks event in amplitude', function() {
        var data = {
          foo: 'bar'
        };

        analytics.track(data);

        expect(amplitudeTrack).to.be.calledOnce;
        expect(amplitudeTrack).to.be.calledWith(data);
      });
    });
  });
});
