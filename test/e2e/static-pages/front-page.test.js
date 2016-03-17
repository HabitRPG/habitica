import { v4 as generateUniqueId } from 'uuid';

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
    let randomName = generateUniqueId();

    button.click();
    browser.sleep(1000);

    element(by.model('loginUsername')).sendKeys(randomName);
    element(by.model('loginPassword')).sendKeys('pass');

    let login = element(by.css('#loginForm input[value="Login"]'));

    login.click();
    browser.sleep(1000);

    let alertDialog = browser.switchTo().alert();

    await expect(alertDialog.getText()).to.eventually.match(/username or password is incorrect./);

    alertDialog.accept();
  });

  it('registers a new user', async function () {
    this.timeout(30000); // TODO: Speed up registration action. Takes way too long and times out unless you extend the timeout

    let button = element(by.id('play-btn'));
    let randomName = generateUniqueId();

    button.click();
    browser.sleep(1000);

    let registerTab = element(by.linkText('Register'));
    registerTab.click();
    element(by.model('registerVals.username')).sendKeys(randomName);
    element(by.model('registerVals.email')).sendKeys(`${randomName}@example.com`);
    element(by.model('registerVals.password')).sendKeys('pass');
    element(by.model('registerVals.confirmPassword')).sendKeys('pass');

    let register = element(by.css('#registrationForm input[type="submit"]'));

    register.click();
    browser.sleep(3000);

    let url = await browser.getCurrentUrl();

    expect(url).to.not.match(/static\/front/);
  });

  it('logs in an existing user');
});
