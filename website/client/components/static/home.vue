<template lang="pug">
nav
  router-link(:to="{name: 'login'}") Login
  router-link(:to="{name: 'register'}") Register
</template>


<script>
export default {
  methods: {
    play () {
      // @TODO:
      // Auth play click
    },
    // passwordReset (email) {
    //   if(email == null || email.length == 0) {
    //     alert(window.env.t('invalidEmail'));
    //   } else {
    //     $http.post(ApiUrl.get() + '/api/v3/user/reset-password', {email:email})
    //       .success(function(){
    //         alert(window.env.t('newPassSent'));
    //       })
    //       .error(function(data){
    //           alert(data.err);
    //       });
    //     }
    // },
  },
};
</script>
