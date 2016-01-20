'use strict';

import i18n from '../../common/script/i18n';

describe('paymentServices', function(){
  let $httpBackend, $window, user, Payments, getAnySubPattern

  getAnySubPattern= /^\/paypal\/subscribe.*/
 
  beforeEach(module('habitrpg'));
 
  beforeEach(function(){
    module(function($provide){
      $window = {href: '', alert: sandbox.spy(), location: {search:   '', pathname: ''}};
      $provide.value('$window', $window);
    });
    
    inject(function($injector) {
    // Set up the mock http service responses
    $httpBackend = $injector.get('$httpBackend');
    Payments = $injector.get('Payments');
    
   // console.log("PAYMENT SERVICES")
   // console.log($httpBackend);
  //  console.log(Payments);
   // /\/user\/(.+)/

 //   $httpBackend.when('GET', '/\/paypal\/subscribe.*/')    .respond({userId: 'userX'}, {'A-Token': 'xxx'});
/*    $httpBackend.whenRoute('GET', '/paypal/subscribe') .respond(function(method, url, data, headers, params) {
    return [200, "Whatever"];
  });
    
    .respond(function(method, url, data, headers, params) {
    return [200, MockUserList[Number(params.id)]];
  }); */
    /*.respond(function(){
      return {userId: 'userX'}, {'A-Token': 'xxx'}
    }); */
   })});
/*
  beforeEach(function(){
    module(function($provide){
      $window = {href: '', alert: sandbox.spy(), location: {search: '', pathname: ''}};
      $provide.value('$window', $window);
    });
    
    

    inject(function(_$httpBackend_, User, _Payments_) {
      Payments = _Payments_;
      $httpBackend = _$httpBackend_;
    });
 //   localStorage.removeItem(STORAGE_SETTINGS_ID);
 //   localStorage.removeItem(STORAGE_USER_ID);
  }); */
  
  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }); 

  
  it('navigates to the correct url', function(){
      let data = {_id: 7, apiToken: "anApiToken", sub: "subKey", coupon: "coupon"};
      let subUrl = '/paypal/subscribe?_id=7&apiToken=anApiToken&sub=subKey&coupon=coupon';
    
      $httpBackend.when('GET', subUrl).respond({place : 'holder'});
      $httpBackend.expectGET(subUrl);
      Payments.showPaypal(data);
      $httpBackend.flush();
  })
    
    it('changes the browser location if paypal responds as expected', function(){
      let fakeUrl = 'http://fake.url';
      
      $httpBackend.when('GET', getAnySubPattern).respond(fakeUrl);
      Payments.showPaypal({});
      $httpBackend.flush();
      
      expect($window.location.href).to.eql(fakeUrl);
    } )
  
    
    it('triggers an alert if there is an error', function(){
      let errorMsg = 'A paypal error occured';
      $httpBackend.when('GET', getAnySubPattern).respond(function(){     
        return  [400,  {err: 'error'}];
      });
      Payments.showPaypal({});
    
      $httpBackend.flush();
      sinon.assert.calledOnce($window.alert);
      sinon.assert.calledWith($window.alert, 'error')
    })

});