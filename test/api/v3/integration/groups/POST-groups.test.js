import {
  generateUser,
  requester,
  translate as t,
} from '../../../../helpers/api-integration.helper';

describe('POST /group', () => {
  let user, api;

   beforeEach(() => {
     return generateUser().then((generatedUser) => {
       user = generatedUser;
       api = requester(user);
     });
   });

   context('Guilds', () => {
    it('returns an error when a user with insufficient funds attempts to create a guild', () => {
      let groupName = "Test Public Guild";
      let groupType = "guild";

      return expect(
        api.post('/groups', {
          name: groupName,
          type: groupType
        })
      )
      .to.eventually.be.rejected.and.eql({
        code: 401,
        error: 'NotAuthorized',
        message: t('messageInsufficientGems'),
      });
    });

     context('public guild', () => {
       it('creates a group', () => {
         let groupName = "Test Public Guild";
         let groupType = "guild";
         let tmpUser;

         return generateUser({balance: 1}).then((generatedUser) => {
           tmpUser = generatedUser;
           api = requester(tmpUser);
           return api.post('/groups', {
             name: groupName,
             type: groupType
           });
         })
         .then((result) => {
           expect(result._id).to.exist;
           expect(result.name).to.equal(groupName);
           expect(result.type).to.equal(groupType);
         })
         .then(() => {
           api = requester(user);
         });
       });
     });

     context('private guild', () => {
       it('creates a group', () => {
         let groupName = "Test Private Guild";
         let groupType = "guild";
         let groupPrivacy = "private";
         let tmpUser;

         return generateUser({balance: 1}).then((generatedUser) => {
           tmpUser = generatedUser;
           api = requester(tmpUser);
           return api.post('/groups', {
             name: groupName,
             type: groupType,
             privacy: groupPrivacy
           });
         })
         .then((result) => {
           expect(result._id).to.exist;
           expect(result.name).to.equal(groupName);
           expect(result.type).to.equal(groupType);
           expect(result.privacy).to.equal(groupPrivacy);
         })
         .then(() => {
           api = requester(tmpUser);
         });
       });
     });
   });

   context('Parties', () => {
     it('creates a party', () => {
       let groupName = "Test Party";
       let groupType = "party";

       return api.post('/groups', {
         name: groupName,
         type: groupType
       })
       .then((result) => {
         expect(result._id).to.exist;
         expect(result.name).to.equal(groupName);
         expect(result.type).to.equal(groupType);
       })
     });

     it('prevents user in a party from creating a party', () => {
        let tmpUser;
        let groupName = "Test Party";
        let groupType = "party";

        return generateUser().then((generatedUser) => {
          tmpUser = generatedUser;
          api = requester(tmpUser);
          return api.post('/groups', {
            name: groupName,
            type: groupType
          });
        })
        .then(() => {
          return expect(api.post('/groups')).to.eventually.be.rejected.and.eql({
            code: 401,
            error: 'NotAuthorized',
            message: t('messageGroupAlreadyInParty'),
          });
        })
        .then(() => {
          api = requester(user);
        });
      });
   });
});
