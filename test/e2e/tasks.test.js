'use strict';

var fs = require('fs');





//State: public welcome page
var HabiticaPublic = (function () {
    
    function generateUserid(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for( var i=0; i < length; i++ ) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    
    return {
        
        get: function () {
            return browser.get('/');
        },
        selfCheck: function () {
            expect(browser.getLocationAbsUrl()).toBe('');
        },
        register: function(done) {
            var userId = generateUserid(10);    
            element(by.id('play-btn')).click();
            element(by.linkText('Register')).click();
            element(by.model('registerVals.username')).sendKeys(userId);
            element(by.model('registerVals.email')).sendKeys(userId + '@example.com');
            element(by.model('registerVals.password')).sendKeys('pass');
            element(by.model('registerVals.confirmPassword')).sendKeys('pass');
            element(by.css('#registrationForm input[type="submit"]')).click();     
            browser.sleep(1000);
        }
    };
}());


//State: welcome tour after registering
var WelcomeTour = (function () {
    return {
        selfCheck: function () {
            expect(browser.getLocationAbsUrl()).toBe('/tasks');
        },
        startTour: function() {
            return element(by.linkText('Enter Habitica')).click();            
        },
        continueTour: function() {
            return element(by.css('button[data-role="next"]')).click();
        },
        endTour: function() {
            return element(by.css('button[data-role="end"]')).click();
        },
        checkFirstTask: function() {
            return element(by.css('ul.todos.main-list div.task-controls label')).click();
        },
        toLvl2: function() {
            return element(by.css('div.modal-content button.btn-primary')).click();
        }
    };
}());


//State: tasks page
var Tasks = (function () {
    var todoList = element.all(by.css('ul.todos.main-list li.uncompleted'));
    
    var sampleTaskName = 'This is my task';
    
    return {
        selfCheck: function () {
            expect(browser.getLocationAbsUrl()).toBe('/tasks');
        },
        get: function () {
            browser.get('/#/tasks');
        },
        countTodos: function() {
            return todoList.count();
        },        
        addTodo: function() {
            element(by.css('form[name="newtodoform"] input[type="text"]')).sendKeys(sampleTaskName);
            element(by.css('form[name="newtodoform"] button[type="submit"]')).click();
        },
        checkTodo: function() {
            element(by.css('ul.todos.main-list li:nth-of-type(1) label')).click();
        },
        logout: function() {
            element(by.css('a[menu="settings"]')).click()
            element(by.css('a[ng-click="logout()"]')).click();      
                      
            browser.sleep(1000);
        }
    };
}());



//Test suites
describe('habitica app', function() {

    it('should redirect index.html to /static/front', function(done) {
        HabiticaPublic.get();
        HabiticaPublic.selfCheck();
        
        done();
    });
    
    it('should register a new user and complete the tour', function (done) {
        HabiticaPublic.register();
        WelcomeTour.selfCheck();
        WelcomeTour.startTour();
        WelcomeTour.continueTour();
        WelcomeTour.continueTour();
        WelcomeTour.continueTour();
        WelcomeTour.continueTour();
        WelcomeTour.endTour();
        WelcomeTour.selfCheck();
        WelcomeTour.checkFirstTask();
        WelcomeTour.toLvl2();
        Tasks.selfCheck();
        
        done();
    });


    //test suite for tasks view
    describe('task view', function() {

        it('should show the tasks page', function (done) {
            Tasks.get();
            Tasks.selfCheck();     
            
            done();
        });
        
        it('should create and close todo', function (done) {
            
            var count = 0; 
            Tasks.countTodos().then(function(countnew) {count = countnew;});            
            Tasks.addTodo();
            browser.sleep(100);
            Tasks.countTodos().then(function(countnew) {expect(countnew).toEqual(count + 1);});
            browser.sleep(100);
            Tasks.checkTodo();
            Tasks.countTodos().then(function(countnew) {expect(countnew).toEqual(count);});
            
            done();
        });
        
        it('should log out the user', function () {
            Tasks.logout();
            HabiticaPublic.selfCheck();
        });

    });
});