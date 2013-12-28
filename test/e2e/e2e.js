'use strict';

describe('front page', function() {
  beforeEach(function(){
    browser.ignoreSynchronization = true;
    browser.get('/');
    browser.sleep(1000);
  });

  it('shows the front page', function(){
    var button = element(by.className('btn'));
    expect(button.getText()).toEqual('Play');
  });

  it("don't login when using wrong credentials", function(){
    var button = element(by.className('btn'));
    button.click();
    element(by.model('loginUsername')).sendKeys('username');
    element(by.model('loginPassword')).sendKeys('pass');
    var login = element(by.css("#login-tab input[value='Login']"));
    login.click();
    var alertDialog = browser.switchTo().alert();
    expect(alertDialog.getText()).toMatch(/Username 'username' not found/);
    alertDialog.accept();
  });

  it('registers a new user', function(){
    var button = element(by.className('btn'));
    button.click();
    browser.sleep(1000);
    var registerTab = element(by.linkText('Register'));
    registerTab.click();
    element(by.model('registerVals.username')).sendKeys('user');
    element(by.model('registerVals.email')).sendKeys('user@example.com');
    element(by.model('registerVals.password')).sendKeys('pass');
    element(by.model('registerVals.confirmPassword')).sendKeys('pass');
    var register = element(by.css("#register-tab input[value='Register']"));
    register.click();
    browser.sleep(2000);
    browser.getCurrentUrl().then(function(url){
      expect(url).toMatch(/#\/tasks$/);
    });
  });
});