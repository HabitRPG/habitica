'use strict';


//State: public welcome page
var HabiticaPublic = (function () {

    function generateUserid (length) {
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
        register: function () {
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

//State: profile/avatar page
var Avatar = (function () {

  var firstShirt = element(by.css('menu[label="Shirts"] > button:first-child'));
  var firstSpecialShirt = element(by.css('menu[label="Special Shirts"] > button'));

  return  {
    selfCheck: function () {
      expect(browser.getLocationAbsUrl()).toBe('/options/profile/avatar');
    },
    get: function () {
              return browser.get('/#/options/profile/avatar');
          },
    navigateToAvatar: function () {
      var customizeAvatarBtn = element(by.linkText('Customize Avatar'));
      customizeAvatarBtn.click();
    },
    selectBroad: function () {
      var broadButton = element(by.buttonText('Broad'));
      broadButton.click();
      browser.sleep(1000);
      expect(firstShirt.getAttribute('class')).toMatch("broad_shirt_black");
      expect(firstShirt.getAttribute('class')).not.toMatch("slim_shirt_black");
      expect(firstSpecialShirt.getAttribute('class')).toMatch("broad_shirt_convict");
      expect(firstSpecialShirt.getAttribute('class')).not.toMatch("slim_shirt_convict");
    },
    selectSlim: function () {
      var slimButton = element(by.buttonText('Slim'));
      slimButton.click();
      browser.sleep(1000);
      expect(firstShirt.getAttribute('class')).toMatch("slim_shirt_black");
      expect(firstShirt.getAttribute('class')).not.toMatch("broad_shirt_black");
      expect(firstSpecialShirt.getAttribute('class')).toMatch("slim_shirt_convict");
      expect(firstSpecialShirt.getAttribute('class')).not.toMatch("broad_shirt_convict");
    },
    selectShirt: function () {
      firstShirt.click();
      expect(firstShirt.getAttribute('class')).toMatch('selectableInventory');
    },
    selectFlower: function () {
      var hairFlower4 = element(by.css('menu[label="Flower"] > button:nth-of-type(5)'));
      hairFlower4.click();
      expect(hairFlower4.getAttribute('class')).toMatch('selectableInventory');
    },
    selectHairColor: function () {
      var color = element(by.css('menu[label="Color"] > button:nth-of-type(1)'));
      var bang = element(by.css('menu[label="Bangs"] > button:nth-of-type(2)'));
      var base = element(by.css('menu[label="Base"] > button:nth-of-type(2)'));
      var hairstyle1 = element(by.css('menu[label="Hairstyle Set 1"] > button:nth-of-type(4)'));
      var hairstyle2 = element(by.css('menu[label="Hairstyle Set 2"] > button:nth-of-type(3)'));
      var beard = element(by.css('menu[label="Beard"] > button:nth-of-type(3)'));
      var mustache = element(by.css('menu[label="Mustache"] > button:nth-of-type(2)'));
      color.click();
      expect(color.getAttribute('class')).toMatch('selectableInventory');
      expect(bang.getAttribute('class')).toMatch('hair_bangs_1_white');
      expect(base.getAttribute('class')).toMatch('hair_base_1_white');
      expect(hairstyle1.getAttribute('class')).toMatch('hair_base_6_white');
      expect(hairstyle2.getAttribute('class')).toMatch('hair_base_11_white');
      expect(beard.getAttribute('class')).toMatch('hair_beard_2_white');
      expect(mustache.getAttribute('class')).toMatch('hair_mustache_1_white');
    }
  }
}());

//State: profile/backgrounds page
var Backgrounds = (function () {

  return  {
    selfCheck: function () {
      expect(browser.getLocationAbsUrl()).toBe('/options/profile/backgrounds');
    },
    get: function () {
              return browser.get('/#/options/profile/backgrounds');
          },
    navigateToBackgrounds: function () {
      var backgroundsBtn = element(by.linkText('Backgrounds'));
      browser.executeScript('window.scrollTo(0,0);');
      backgroundsBtn.click();
    }
  }
}());

//State: profile/stats page
var Stats = (function () {

  return  {
    selfCheck: function () {
      expect(browser.getLocationAbsUrl()).toBe('/options/profile/stats');
    },
    get: function () {
        return browser.get('/#/options/profile/stats');
    },
    navigateToStats: function () {
      var backgroundsBtn = element(by.linkText('Stats & Achievements'));
      backgroundsBtn.click();
    },
    endModal: function() {
        return element(by.css('button[data-role="end"]')).click();
    }
  }
}());

//State: profile/profile page
var Profile = (function () {

  return  {
    selfCheck: function () {
      expect(browser.getLocationAbsUrl()).toBe('/options/profile/profile');
    },
    get: function () {
      return browser.get('/#/options/profile/profile');
    },
    navigateToProfile: function () {
      var backgroundsBtn = element(by.linkText('Profile'));
      backgroundsBtn.click();
    },
    edit: function () {
      var editBtn = element(by.css('button[ng-click="_editing.profile = true"]'));
      var name = "someName";
      var blurb = "bla bla bla";
      editBtn.click();
      browser.sleep(1000);
      var nameInput = element(by.model('editingProfile.name'));
      nameInput.clear();
      nameInput.sendKeys(name);
      element(by.model('editingProfile.blurb')).sendKeys(blurb);
      element(by.css('input[value="Save"]')).click();
      browser.sleep(1000);
      expect(element(by.css('span[ng-show="profile.profile.name"]')).getText()).toBe(name);
      expect(element(by.css('markdown[ng-show="profile.profile.blurb"] > p')).getText()).toBe(blurb);
    }
  }
}());


// test suites
describe('Habitica app', function () {

  it('should register a new user and complete the tour', function (done) {
      HabiticaPublic.get();
      HabiticaPublic.register();
      WelcomeTour.startTour();
      WelcomeTour.continueTour();
      WelcomeTour.continueTour();
      WelcomeTour.continueTour();
      WelcomeTour.continueTour();
      WelcomeTour.endTour();
      WelcomeTour.selfCheck();
      done();
  });

  //test suite for the profile view
  describe('profile (user) view', function() {

      it("should show the User landing tab (profile/avatar)", function (done) {
        Avatar.get();
        Avatar.selfCheck();
        //browser.sleep(1000);
        done();
      });

      it("should display broad shirts (tests only first black shirt)", function (done) {
        Avatar.selectBroad();
        //browser.sleep(1000);
        done();
      });

      it("should display slim shirts (tests only first black shirt)", function (done) {
        Avatar.selectSlim();
        //browser.sleep(1000);
        done();
      });

      it("selected shirt should have class selectableInventory (tests only first black shirt)", function (done) {
        Avatar.selectShirt();
        //browser.sleep(1000);
        done();
      });

      it("selected flower should have class selectableInventory (tests only flower 4)", function (done) {
        Avatar.selectFlower();
        //browser.sleep(1000);
        done();
      });

      it("selected hair color should have class selectableInventory (tests only first white color). Bangs, base, beard and moustache should adapt.", function (done) {
        Avatar.selectHairColor();
        //browser.sleep(1000);
        done();
      });

      it("should show the profile/backgrounds page", function(done) {
        Backgrounds.navigateToBackgrounds();
        Backgrounds.selfCheck();
        //browser.sleep(1000);
        done();
      });

      it("should show the profile/stats page", function(done) {
        Stats.navigateToStats();
        Stats.selfCheck();
        Stats.endModal();
        //browser.sleep(1000);
        done();
      });

      it("should show the profile/profile page", function(done) {
        Profile.navigateToProfile();
        Profile.selfCheck();
        Profile.edit();
        //browser.sleep(1000);
        done();
      });

      it("should show the profile/avatar page", function(done) {
        Avatar.navigateToAvatar();
        Avatar.selfCheck();
        //browser.sleep(1000);
        done();
      });
    });
  });
