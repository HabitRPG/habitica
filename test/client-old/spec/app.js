'use strict';

describe('AppJS', function() {
  describe('Automatic page refresh', function(){
    var clock;
    beforeEach(function () {
      clock = sandbox.useFakeTimers();
      sandbox.stub(window, "refresher", function(){return true});
    });

    it('should not call refresher if idle time is less than 6 hours', function() {
      window.awaitIdle();
      clock.tick(21599999);
      expect(window.refresher).to.not.be.called;
    });

    it('should not call refresher if awaitIdle is called within 6 hours', function() {
      window.awaitIdle();
      clock.tick(21500000);
      window.awaitIdle();
      clock.tick(21500000);
      expect(window.refresher).to.not.be.called;
    });

    it('should call refresher if idle time is 6 hours or greater', function() {
      window.awaitIdle();
      clock.tick(21900000);
      expect(window.refresher).to.be.called;
    });
  });
});
