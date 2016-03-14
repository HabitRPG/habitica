'use strict';

var EC = protractor.ExpectedConditions;

// State: profile/avatar page
var Avatar = (function () {
  var firstShirt = element(by.css('menu[label="Shirts"] > button:first-child'));
  var firstSpecialShirt = element(by.css('menu[label="Special Shirts"] > button:first-of-type'));
  var hairFlower4 = element(by.css('menu[label="Flower"] > button:nth-of-type(5)'));
  return  {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/options/profile/avatar');
    },
    get () {
      browser.get('/#/options/profile/avatar');
    },
    navigateToAvatar () {
      var customizeAvatarBtn = element(by.linkText('Customize Avatar'));
      browser.executeScript('window.scrollTo(0,0);');
      customizeAvatarBtn.click();
    },
    selectBroad () {
      var broadButton = element(by.buttonText('Broad'));
      browser.executeScript('window.scrollTo(0,0);');
      browser.wait(EC.elementToBeClickable(broadButton), 3000, 'broad button not clickable');
      broadButton.click().then(function () {
        firstShirt.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('broad_shirt_black');
          expect(clazz).to.not.have.string('slim_shirt_black');
        });
        firstSpecialShirt.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('broad_shirt_convict');
          expect(clazz).to.not.have.string('slim_shirt_convict');
        });
      });
    },
    selectSlim () {
      var slimButton = element(by.buttonText('Slim'));
      slimButton.click().then(function () {
        firstShirt.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('slim_shirt_black');
          expect(clazz).to.not.have.string('broad_shirt_black');
        });
        firstSpecialShirt.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('slim_shirt_convict');
          expect(clazz).to.not.have.string('broad_shirt_convict');
        });
      });
    },
    selectShirt () {
      firstShirt.click().then(function () {
        firstShirt.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('selectableInventory');
        });
      });
    },
    selectFlower () {
      // browser.executeScript('window.scrollTo(0,600);');
      // browser.actions().mouseMove(hairFlower4).mouseDown().mouseUp().perform();
      // browser.executeScript('arguments[0].click()', hairFlower4);
      hairFlower4.click().then(function () {
        hairFlower4.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('selectableInventory');
        });
      });
    },
    selectHairColor () {
      var color = element(by.css('menu[label="Color"] > button:nth-of-type(1)'));
      var bang = element(by.css('menu[label="Bangs"] > button:nth-of-type(2)'));
      var base = element(by.css('menu[label="Base"] > button:nth-of-type(2)'));
      var hairstyle1 = element(by.css('menu[label="Hairstyle Set 1"] > button:nth-of-type(4)'));
      var hairstyle2 = element(by.css('menu[label="Hairstyle Set 2"] > button:nth-of-type(3)'));
      var beard = element(by.css('menu[label="Beard"] > button:nth-of-type(3)'));
      var mustache = element(by.css('menu[label="Mustache"] > button:nth-of-type(2)'));
      browser.executeScript('window.scrollTo(0,0);');
      color.click().then(function () {
        color.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('selectableInventory');
        });
        bang.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_bangs_1_white');
        });
        base.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_base_1_white');
        });
        hairstyle1.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_base_6_white');
        });
        hairstyle2.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_base_11_white');
        });
        beard.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_beard_2_white');
        });
        mustache.getAttribute('class').then(function (clazz) {
          expect(clazz).to.have.string('hair_mustache_1_white');
        });
      });
    },
  };
}());

// State: profile/backgrounds page
var Backgrounds = (function () {
  return  {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/options/profile/backgrounds');
    },
    get () {
      browser.get('/#/options/profile/backgrounds');
    },
    navigateToBackgrounds () {
      var backgroundsBtn = element(by.linkText('Backgrounds'));
      browser.executeScript('window.scrollTo(0,0);');
      backgroundsBtn.click();
    },
  };
}());
// State: profile/stats page
var Stats = (function () {
  return  {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/options/profile/stats');
    },
    get () {
      browser.get('/#/options/profile/stats');
    },
    navigateToStats () {
      var backgroundsBtn = element(by.linkText('Stats & Achievements'));
      backgroundsBtn.click();
    },
    endModal () {
      element(by.css('button[data-role="end"]')).click();
    },
  };
}());
// State: profile/profile page
var Profile = (function () {
  return  {
    selfCheck () {
      expect(browser.getLocationAbsUrl()).to.eventually.eql('/options/profile/profile');
    },
    get () {
      browser.get('/#/options/profile/profile');
    },
    navigateToProfile () {
      var backgroundsBtn = element(by.linkText('Profile'));
      browser.executeScript('window.scrollTo(0,0);');
      backgroundsBtn.click();
    },
    edit () {
      var editBtn = element(by.css('button[ng-click="_editing.profile = true"]'));
      var name = 'someName';
      var blurb = 'bla bla bla';
      editBtn.click();
      browser.sleep(1000);
      var nameInput = element(by.model('editingProfile.name'));
      nameInput.clear();
      nameInput.sendKeys(name);
      element(by.model('editingProfile.blurb')).sendKeys(blurb);
      element(by.css('input[value="Save"]')).click();
      browser.sleep(1000);
      expect(element(by.css('span[ng-show="profile.profile.name"]')).getText()).to.eventually.eql(name);
      expect(element(by.css('markdown[ng-show="profile.profile.blurb"] > p')).getText()).to.eventually.eql(blurb);
    },
  };
}());
// test suite for the profile view
describe('Profile (user) view', function () {
  it('should show the User landing tab (profile/avatar)', function (done) {
    Avatar.get();
    browser.sleep(1000);
    Avatar.selfCheck();
    done();
  });
  it('should display broad shirts (tests only first black shirt)', function (done) {
    Avatar.selectBroad();
    // browser.sleep(1000);
    done();
  });
  it('should display slim shirts (tests only first black shirt)', function (done) {
    Avatar.selectSlim();
    // browser.sleep(1000);
    done();
  });
  it('selected shirt should have class selectableInventory (tests only first black shirt)', function (done) {
    Avatar.selectShirt();
    // browser.sleep(1000);
    done();
  });
  it('selected flower should have class selectableInventory (tests only flower 4)', function (done) {
    Avatar.selectFlower();
    browser.sleep(5000);
    done();
  });
  it('selected hair color should have class selectableInventory (tests only first white color). Bangs, base, beard and moustache should adapt.', function (done) {
    Avatar.selectHairColor();
     browser.sleep(5000);
    done();
  });
  it('should show the profile/backgrounds page', function (done) {
    Backgrounds.navigateToBackgrounds();
    browser.sleep(1000);
    Backgrounds.selfCheck();
    done();
  });
  it('should show the profile/stats page', function (done) {
    Stats.navigateToStats();
    browser.sleep(1000);
    Stats.selfCheck();
    Stats.endModal();
    done();
  });
  it('should show the profile/profile page', function (done) {
    Profile.navigateToProfile();
    browser.sleep(1000);
    Profile.selfCheck();
    Profile.edit();
    browser.sleep(500);
    done();
  });
  it('should show the profile/avatar page', function (done) {
    Avatar.navigateToAvatar();
    browser.sleep(1000);
    Avatar.selfCheck();
    done();
  });
});
