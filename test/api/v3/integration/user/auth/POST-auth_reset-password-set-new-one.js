describe('POST /auth/reset-password-set-new-one', () => {
  // Tests to validate the validatePasswordResetCodeAndFindUser function
  it('renders the error page if the code is missing', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the code is invalid json', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the code cannot be decrypted', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the code is expired', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the user has no local auth', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the code doesn\'t match the on user.auth.passwordResetCode', async () => {
    expect(true).to.equal(false);
  });

  //

  it('renders the error page if the new password is missing', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the password confirmation is missing', async () => {
    expect(true).to.equal(false);
  });

  it('renders the error page if the password confirmation does not match', async () => {
    expect(true).to.equal(false);
  });

  it('renders the success page and save the user', async () => {
    expect(true).to.equal(false);
    // TODO test page rendering, new password is saved and hashed with bcrypt, auth.passwordResetCode is reset
  });
});
