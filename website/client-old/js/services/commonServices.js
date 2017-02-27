'use strict';

angular.module('habitrpg')
  .service('Common', ['$http', 'Notification', function ($http, Notification) {
    var user;

    // @TODO: The user service has too many responsibilities. For now this code is duplicated.
    // The reason of we need three serparate classes for this relation User->buy, Undo, User->Refund
    function callOpsFunctionAndRequest (opName, endPoint, method, paramString, opData) {
      if (!opData) opData = {};

      var clientResponse;

      try {
        var args = [user];
        if (opName === 'rebirth' || opName === 'reroll' || opName === 'reset') {
          args.push(user.habits.concat(user.dailys).concat(user.rewards).concat(user.todos));
        }

        args.push(opData);
        clientResponse = habitrpgShared.ops[opName].apply(null, args);
      } catch (err) {
        Notification.text(err.message);
        return;
      }

      var clientMessage = clientResponse[1];

      if (clientMessage) {
        Notification.text(clientMessage);
      }

      var url = '/api/v3/user/' + endPoint;
      if (paramString) {
        url += '/' + paramString
      }

      var body = {};
      if (opData.body) body = opData.body;

      var queryString = '';
      if (opData.query) queryString = '?' + $.param(opData.query)

      $http({
        method: method,
        url: url + queryString,
        data: body,
      })
      .then(function (response) {
        if (response.data.message && response.data.message !== clientMessage) {
          Notification.text(response.data.message);
        }
        if (opName === 'openMysteryItem') {
          var openedItem = clientResponse[0];
          var text = Content.gear.flat[openedItem.key].text();
          Notification.drop(env.t('messageDropMysteryItem', {dropText: text}), openedItem);
        }
      });
    }

    var api = {};

    api.refund = function (data, userInc) {
      user = userInc;
      callOpsFunctionAndRequest('refund', 'refund', "POST", data.params.key, data);
    };

    return api;
  }]);
