describe('GET /auth/reset-password-set-new-one', () => {
  // Tests to validate the validatePasswordResetCodeAndFindUser function

  it('returns the error page if the code is missing', async () => {
    expect(true).to.equal(false);
  });

  it('returns the error page if the code is invalid json', async () => {
    expect(true).to.equal(false);
  });

  it('returns the error page if the code cannot be decrypted', async () => {
    expect(true).to.equal(false);
  });

  it('returns the error page if the code is expired', async () => {
    expect(true).to.equal(false);
  });

  it('returns the error page if the user has no local auth', async () => {
    expect(true).to.equal(false);
  });

  it('returns the error page if the code doesn\'t match the on user.auth.passwordResetCode', async () => {
    expect(true).to.equal(false);
  });

  //

  it('returns the password reset page if the password reset code is valid', async () => {
    expect(true).to.equal(false);
  });
});

