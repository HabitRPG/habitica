/* eslint-disable camelcase */

import {
  generateUser,
  requester,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('POST /user/auth/pusher', () => {
  let user;
  let endpoint = '/user/auth/pusher';

  beforeEach(async () => {
    user = await generateUser();
  });

  it('requires authentication', async () => {
    let api = requester();

    await expect(api.post(endpoint)).to.eventually.be.rejected.and.eql({
      code: 401,
      error: 'NotAuthorized',
      message: t('missingAuthHeaders'),
    });
  });

  it('returns an error if req.body.socket_id is missing', async () => {
    await expect(user.post(endpoint, {
      channel_name: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.body.channel_name is missing', async () => {
    await expect(user.post(endpoint, {
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('invalidReqParams'),
    });
  });

  it('returns an error if req.body.channel_name is badly formatted', async () => {
    await expect(user.post(endpoint, {
      channel_name: '123',
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid Pusher channel type.',
    });
  });

  it('returns an error if an invalid channel type is passed', async () => {
    await expect(user.post(endpoint, {
      channel_name: 'invalid-group-123',
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid Pusher channel type.',
    });
  });

  it('returns an error if an invalid resource type is passed', async () => {
    await expect(user.post(endpoint, {
      channel_name: 'presence-user-123',
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid Pusher resource type.',
    });
  });

  it('returns an error if an invalid resource id is passed', async () => {
    await expect(user.post(endpoint, {
      channel_name: 'presence-group-123',
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: 'Invalid Pusher resource id, must be a UUID.',
    });
  });

  it('returns an error if the passed resource id doesn\'t match the user\'s party', async () => {
    await expect(user.post(endpoint, {
      channel_name: `presence-group-${generateUUID()}`,
      socket_id: '123',
    })).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: 'Resource id must be the user\'s party.',
    });
  });
});
