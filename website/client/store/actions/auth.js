import axios from 'axios';

export async function register (store, params) {
  let url = '/api/v3/user/auth/local/register';
  let result = await axios.post(url, {
    username: params.username,
    email: params.email,
    password: params.password,
    confirmPassword: params.passwordConfirm,
  });

  let user = result.data.data;

  let userLocalData = JSON.stringify({
    auth: {
      apiId: user._id,
      apiToken: user.apiToken,
    },
  });
  localStorage.setItem('habit-mobile-settings', userLocalData);

  // @TODO: I think we just need analytics here
  // Auth.runAuth(res.data._id, res.data.apiToken);
  // Analytics.register();
  // $scope.registrationInProgress = false;
  // Alert.authErrorAlert(data, status, headers, config)

  store.state.user.data = user;
}
