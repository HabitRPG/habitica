'use strict';

// State: public welcome page
let HabiticaPublic = (function () {
  return {
    get () {
      return browser.get('/');
    },
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('');
    },
  };
}());

// State: welcome tour after registering
let WelcomeTour = (function () {
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
let Tasks = (function () {
  let todoList = element.all(by.css('ul.todos.main-list li.uncompleted'));
  let sampleTaskName = 'This is my task';

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
    this.timeout(25000);
    WelcomeTour.selfCheck();
    WelcomeTour.startTour();
    browser.sleep(800);
    WelcomeTour.continueTour();
    browser.sleep(800);
    WelcomeTour.continueTour();
    // if we don't wait that long the next button is covered by notifications
    // TODO find better solution
    browser.sleep(8000);
    WelcomeTour.continueTour();
    browser.sleep(800);
    WelcomeTour.continueTour();
    browser.sleep(800);
    WelcomeTour.endTour();
    browser.sleep(800);
    WelcomeTour.selfCheck();
    WelcomeTour.checkFirstTask();
    browser.sleep(800);
    WelcomeTour.toLvl2();
    browser.sleep(800);
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
      let count = 0;
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
      this.timeout(15000);
      browser.sleep(8000);
      Tasks.logout();
      HabiticaPublic.selfCheck();
    });
  });
});
