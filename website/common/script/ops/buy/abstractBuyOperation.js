export class NotImplementedError extends Error {
  constructor (str) {
    super(`Method: '${str}' not implemented`);
  }
}

export class AbstractBuyOperation {
  /**
   * @param {User} user - the User-Object
   * @param {Request} req - the Request-Object
   * @param {analytics} analytics
   */
  constructor (user, req, analytics) {
    this.user = user;
    this.req = req;
    this.analytics = analytics;
  }

  /**
   * Method is called to save the params as class-fields in order to access them
   */
  extractAndValidateParams () {
    throw new NotImplementedError('extractAndValidateParams');
  }

  executeChanges () {
    throw new NotImplementedError('executeChanges');
  }

  sendToAnalytics () {
    throw new NotImplementedError('sendToAnalytics');
  }

  purchase () {
    this.extractAndValidateParams();

    let resultObj = this.executeChanges();

    if (this.analytics) {
      this.sendToAnalytics(resultObj);
    }

    return resultObj;
  }

}
