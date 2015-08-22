'use strict';

describe('front page', function() {
  beforeEach(function(){
    browser.ignoreSynchronization = true;
    browser.get('/');
    browser.sleep(1000);
  });

  // based on https://github.com/angular/protractor/issues/114#issuecomment-29046939
  afterEach(function(){
    var currentSpec = jasmine.getEnv().currentSpec;
    var passed = currentSpec.results().passed();
    if(!passed){
      var filename = 'exception_' + currentSpec.description + '.png';
      browser.takeScreenshot().then(function(png){
        var fs = require('fs');
        var buffer = new Buffer(png, 'base64');
        var stream = fs.createWriteStream(filename);
        stream.write(buffer);
        stream.end();
      });
    }
  });

  it('shows the front page', function(){
    var button = element(by.id('play-btn'));
    expect(button.getText()).toEqual('Join for free');
  });

  it("don't login when using wrong credentials", function(){
    var button = element(by.id('play-btn'));
    button.click();
    browser.sleep(1000);
    element(by.model('loginUsername')).sendKeys('username');
    element(by.model('loginPassword')).sendKeys('pass');
    var login = element(by.css("#loginForm input[value='Login']"));
    login.click();
    var alertDialog = browser.switchTo().alert();
    expect(alertDialog.getText()).toMatch("Uh-oh - your username or password is incorrect.\n- Make sure your username or email is typed correctly.\n- You may have signed up with Facebook, not email. Double-check by trying Facebook login.\n- If you forgot your password, click \"Forgot Password\".");
    alertDialog.accept();
  });

  xit('registers a new user', function(){
    var button = element(by.id('play-btn'));
    button.click();
    browser.sleep(1000);
    var registerTab = element(by.linkText('Register'));
    registerTab.click();
    element(by.model('registerVals.username')).sendKeys('user');
    element(by.model('registerVals.email')).sendKeys('user@example.com');
    element(by.model('registerVals.password')).sendKeys('pass');
    element(by.model('registerVals.confirmPassword')).sendKeys('pass');
    var register = element(by.css("#registrationForm input[value='Register']"));
    register.click();
    browser.sleep(1000);
    browser.getCurrentUrl().then(function(url){
      expect(url).not.toMatch(/static\/front/);
    });
  });
});
