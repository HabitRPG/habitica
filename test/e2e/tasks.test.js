'use strict';

// State: public welcome page
var HabiticaPublic = (function () {
  function generateUserid (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  return {
    get () {
      return browser.get('/');
    },
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('');
    },
    register () {
      var userId = generateUserid(10);
      element(by.id('play-btn')).click();
      element(by.linkText('Register')).click();
      element(by.model('registerVals.username')).sendKeys(userId);
      element(by.model('registerVals.email')).sendKeys(userId + '@example.com');
      element(by.model('registerVals.password')).sendKeys('pass');
      element(by.model('registerVals.confirmPassword')).sendKeys('pass');
      element(by.css('#registrationForm input[type="submit"]')).click();
      browser.sleep(3000);
    },
  };
}());

// State: welcome tour after registering
var WelcomeTour = (function () {
  return {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/tasks');
    },
    startTour () {
      return element(by.linkText('Enter Habitica')).click();
    },
    continueTour () {
      return element(by.css('div.tour-intro button[data-role="next"]')).click();
    },
    endTour () {
      return element(by.css('div.tour-intro button[data-role="end"]')).click();
    },
    checkFirstTask () {
      return element(by.css('ul.todos.main-list div.task-controls label')).click();
    },
    toLvl2 () {
      return element(by.css('div.modal-content button.btn-primary')).click();
    },
  };
}());

// State: tasks page
var Tasks = (function () {
  var todoList = element.all(by.css('ul.todos.main-list li.uncompleted'));
  var sampleTaskName = 'This is my task';

  return {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/tasks');
    },
    get () {
      browser.get('/#/tasks');
    },
    countTodos () {
      return todoList.count();
    },
    addTodo () {
      element(by.css('form[name="newtodoform"] input[type="text"]')).sendKeys(sampleTaskName);
      element(by.css('form[name="newtodoform"] button[type="submit"]')).click();
    },
    checkTodo () {
      element(by.css('ul.todos.main-list li:nth-of-type(1) label')).click();
    },
    logout () {
      element(by.css('a[menu="settings"]')).click();
      element(by.css('a[ng-click="logout()"]')).click();

      browser.sleep(1000);
    },
  };
}());

// Test suites
describe('habitica app', function () {
  it('should complete the tour', function (done) {
    // registration is done in front-page.test.js
    // TODO check if we should also perform the registration in this test suite
    // HabiticaPublic.register();
    WelcomeTour.selfCheck();
    WelcomeTour.startTour();
    browser.sleep(500);
    WelcomeTour.continueTour();
    browser.sleep(500);
    WelcomeTour.continueTour();
    browser.sleep(500);
    WelcomeTour.continueTour();
    browser.sleep(500);
    WelcomeTour.continueTour();
    browser.sleep(500);
    WelcomeTour.endTour();
    browser.sleep(500);
    WelcomeTour.selfCheck();
    WelcomeTour.checkFirstTask();
    browser.sleep(500);
    WelcomeTour.toLvl2();
    browser.sleep(500);
    Tasks.selfCheck();

    done();
  });

  // test suite for tasks view
  describe('task view', function () {
    it('should show the tasks page', function (done) {
      Tasks.get();
      Tasks.selfCheck();

      done();
    });

    it('should create and close todo', function (done) {
      var count = 0;
      Tasks.countTodos().then(function (countnew) {
        count = countnew;
      });
      Tasks.addTodo();
      browser.sleep(100);
      Tasks.countTodos().then(function (countnew) {
        expect(countnew).to.eql(count + 1);
      });
      browser.sleep(100);
      Tasks.checkTodo();
      Tasks.countTodos().then(function (countnew) {
        expect(countnew).to.eql(count);
      });

      done();
    });

    it('should log out the user', function () {
      Tasks.logout();
      HabiticaPublic.selfCheck();
    });
  });
});
