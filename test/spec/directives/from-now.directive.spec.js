'use strict';

describe('fromNow Directive', function() {
  var element, scope;
  var fromNow = 'recently';
  var diff    = 0;

  beforeEach(module('habitrpg'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.message = {};

    sandbox.stub(window, 'moment').returns({
      fromNow: function() { return fromNow },
      diff:    function() { return diff    }
    });

    element = "<p from-now></p>";

    element = $compile(element)(scope);
    scope.$digest();
  }));

  afterEach(function() {
    window.moment.restore();
  });

  it('sets the element text to the elapsed time', function() {
    expect(element.text()).to.eql('recently');
  });

  describe('when the elapsed time is less than an hour', function() {
    beforeEach(inject(function($compile) {
      fromNow = 'recently';
      diff    = 0;

      element = $compile('<p from-now></p>')(scope);
      scope.$digest();
    }));

    it('updates the elapsed time every minute', inject(function($interval) {
      fromNow = 'later';

      expect(element.text()).to.eql('recently');
      $interval.flush(60001);

      expect(element.text()).to.eql('later');
    }));

    it('moves to hourly updates after an hour', inject(function($timeout, $interval) {
      diff = 61;

      $timeout.flush();
      $interval.flush(60001);

      fromNow = 'later';

      $interval.flush(60001);
      expect(element.text()).to.eql('recently');

      $interval.flush(3600000);
      expect(element.text()).to.eql('later');
    }));
  });

  describe('when the elapsed time is more than an hour', function() {
    beforeEach(inject(function($compile) {
      fromNow = 'recently';
      diff    = 65;

      element = $compile('<p from-now></p>')(scope);
      scope.$digest();
    }));

    it('updates the elapsed time every hour', inject(function($interval) {
      fromNow = 'later';

      expect(element.text()).to.eql('recently');

      $interval.flush(60001);
      expect(element.text()).to.eql('recently');

      $interval.flush(3600000);
      expect(element.text()).to.eql('later');
    }));
  });

});
