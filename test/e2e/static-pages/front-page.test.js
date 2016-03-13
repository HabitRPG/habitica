describe('Static Front Page', () => {
  beforeEach(() => {
    browser.get('/');
    browser.sleep(1000);
  });

  it('shows the front page', async () => {
    let button = element(by.id('play-btn'));
    await expect(button.getText()).to.eventually.eql('Join for free');
  });

  it('does not login when using wrong credentials', async () => {
    let button = element(by.id('play-btn'));
    button.click();
    browser.sleep(1000);
    element(by.model('loginUsername')).sendKeys('username');
    element(by.model('loginPassword')).sendKeys('pass');
    let login = element(by.css('#loginForm input[value="Login"]'));
    login.click();
    browser.sleep(1000);
    let alertDialog = browser.switchTo().alert();

    await expect(alertDialog.getText()).to.eventually.match(/username or password is incorrect./);

    alertDialog.accept();
  });

  xit('registers a new user', function () {
    let button = element(by.id('play-btn'));
    button.click();
    browser.sleep(1000);
    let registerTab = element(by.linkText('Register'));
    registerTab.click();
    element(by.model('registerVals.username')).sendKeys('user');
    element(by.model('registerVals.email')).sendKeys('user@example.com');
    element(by.model('registerVals.password')).sendKeys('pass');
    element(by.model('registerVals.confirmPassword')).sendKeys('pass');
    let register = element(by.css('#registrationForm input[value="Register"]'));
    register.click();
    browser.sleep(1000);
    browser.getCurrentUrl().then(function (url) {
      expect(url).not.toMatch(/static\/front/);
    });
  });
});
