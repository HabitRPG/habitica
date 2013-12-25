'use strict';

describe('index page', function() {
  beforeEach(function(){
    browser.ignoreSynchronization = true;
    browser.get('http://localhost:3000/');
  });

  it('shows the front page', function(){
    // browser.sleep(3000);
    var button = element(by.className('btn'));
    expect(button.getText()).toEqual('Play');
  });

  it('shows the login form', function(){
    var button = element(by.className('btn'));
    button.click();
    
  });


});