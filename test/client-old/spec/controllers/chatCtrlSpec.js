'use strict';

describe("Chat Controller", function() {
  var scope, ctrl, user, $rootScope, $controller, $httpBackend, html;

  beforeEach(function() {
    module(function($provide) {
      $provide.value('User', {});
    });

    inject(function(_$rootScope_, _$controller_, _$compile_, _$httpBackend_){
      user = specHelper.newUser();
      user._id = "unique-user-id";
      $rootScope = _$rootScope_;

      scope = _$rootScope_.$new();

      $controller = _$controller_;
      $httpBackend = _$httpBackend_;

      // Load RootCtrl to ensure shared behaviors are loaded
      $controller('RootCtrl',  {$scope: scope, User: {user: user}});

      html = _$compile_('<div><form ng-submit="postChat(group, message.content)"><textarea submit-on-meta-enter ng-model="message.content" ng-model-options="{debounce: 250}"></textarea></form></div>')(scope);
      document.body.appendChild(html[0]);
      ctrl = $controller('ChatCtrl', {$scope: scope, $element: html});
    });
  });
  
  afterEach(function() {
    html.remove();
  });

  describe('copyToDo', function() {
    it('when copying a user message it opens modal with information from message', function() {
      scope.group = {
        name: "Princess Bride"
      };

      var modalSpy = sandbox.spy($rootScope, "openModal");
      var message = {
        uuid: 'the-dread-pirate-roberts',
        user: 'Wesley',
        text: 'As you wish'
      };

      scope.copyToDo(message);

      modalSpy.should.have.been.calledOnce;

      modalSpy.should.have.been.calledWith('copyChatToDo', sinon.match(function(callArgToMatch){
        return callArgToMatch.controller == 'CopyMessageModalCtrl'
            && callArgToMatch.scope.text == message.text
      }));
    });

    it('when copying a system message it opens modal with information from message', function() {
      scope.group = {
        name: "Princess Bride"
      };

      var modalSpy = sandbox.spy($rootScope, "openModal");
      var message = {
        uuid: 'system',
        text: 'Wesley attacked the ROUS in the Fire Swamp'
      };

      scope.copyToDo(message);

      modalSpy.should.have.been.calledOnce;

      modalSpy.should.have.been.calledWith('copyChatToDo', sinon.match(function(callArgToMatch){
        return callArgToMatch.controller == 'CopyMessageModalCtrl'
            && callArgToMatch.scope.text == message.text
      }));
    });
  });
  
  it('updates model on enter key press', function() {
    // Set initial state of the page with some dummy data.
    scope.group = { name: 'group' };
    
    // The main controller is going to try to fetch the template right off. 
    // No big deal, just return an empty string.
    $httpBackend.when('GET', 'partials/main.html').respond('');

    // Let the page settle, and the controllers set their initial state.
    $rootScope.$digest();

    // Watch for calls to postChat & make sure it doesn't do anything.
    let postChatSpy = sandbox.stub(scope, 'postChat');
    
    // Pretend we typed 'aaa' into the textarea.
    var textarea = html.find('textarea');    
    textarea[0].value = 'aaa';
    let inputEvent = new Event('input');
    textarea[0].dispatchEvent(inputEvent);

    // Give a change for the ng-model watchers to notice that the value in the
    // textarea has changed.
    $rootScope.$digest();
    
    // Since no time has elapsed and we debounce the model change, we should 
    // see no model update just yet.
    expect(scope.message.content).to.equal('');
    
    // Now, press the enter key in the textarea. We use jquery here to paper 
    // over browser differences with initializing the keyboard event.
    var keyboardEvent = jQuery.Event('keydown', {keyCode: 13, key: 'Enter', metaKey: true});
    jQuery(textarea).trigger(keyboardEvent);

    // Now, allow the model to update given the changes to the page still
    // without letting any time elapse...
    $rootScope.$digest();
    
    // ... and nevertheless seeing the desired call to postChat with the right
    // data. Yay!
    postChatSpy.should.have.been.calledWith(scope.group, 'aaa');
  });
});

