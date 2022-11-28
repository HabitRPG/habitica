import _ from 'lodash';
import moment from 'moment';
// import Pageres from 'pageres';
// import nconf from 'nconf';
// import got from 'got';
import md from 'habitica-markdown';
import csvStringify from '../../libs/csvStringify';
import { marshallUserData } from '../../libs/xmlMarshaller';
import { NotFound } from '../../libs/errors';
import * as Tasks from '../../models/task';
import * as inboxLib from '../../libs/inbox';
// import { model as User } from '../../models/user';
import { authWithSession } from '../../middlewares/auth';
/* import {
  S3,
} from '../../libs/aws'; */

// const S3_BUCKET = nconf.get('S3_BUCKET');

// const BASE_URL = nconf.get('BASE_URL');

const api = {};

/**
 * @apiDefine DataExport Data Export
 * These routes allow you to download backups of your data.
 *
 * **Note:** They are intended to be used on the website only and as such are part
 * of the private API and may change at any time.
 */

/**
 * @api {get} /export/history.csv Export user tasks history in CSV format
 * @apiDescription History is only available for habits and dailies so todos and rewards won't be included. Can only be used on [https://habitica.com](https://habitica.com).
 * @apiName ExportUserHistory
 * @apiGroup DataExport
 *
 * @apiSuccess {CSV} File A csv file of your task history.
 *
 * @apiSuccessExample {csv} history.csv
 * Task Name,Task ID,Task Type,Date,Value
 * Be Awesome,e826ddfa-dc2e-445f-a06c-64d3881982ea,habit,2016-06-02 13:26:05,1
 * Be Awesome,e826ddfa-dc2e-445f-a06c-64d3881982ea,habit,2016-06-03 05:06:55,1.026657310999762
 * ...
 */
api.exportUserHistory = {
  method: 'GET',
  url: '/export/history.csv',
  middlewares: [authWithSession],
  async handler (req, res) {
    const { user } = res.locals;

    const tasks = await Tasks.Task.find({
      userId: user._id,
      type: { $in: ['habit', 'daily'] },
    }).exec();

    const output = [
      ['Task Name', 'Task ID', 'Task Type', 'Date', 'Value'],
    ];

    tasks.forEach(task => {
      task.history.forEach(history => {
        output.push([
          task.text,
          task._id,
          task.type,
          moment(history.date).format('YYYY-MM-DD HH:mm:ss'),
          history.value,
        ]);
      });
    });

    res.set({
      'Content-Type': 'text/csv',
      'Content-disposition': 'attachment; filename=habitica-tasks-history.csv',
    });

    const csvRes = await csvStringify(output);
    res.status(200).send(csvRes);
  },
};

// Convert user to json and attach tasks divided by type and inbox messages
// at user.tasks[`${taskType}s`] (user.tasks.{dailys/habits/...})
async function _getUserDataForExport (user) {
  const userData = user.toJSON();
  userData.tasks = {};

  userData.inbox.messages = {};

  const [tasks, messages] = await Promise.all([
    Tasks.Task.find({
      userId: user._id,
    }).exec(),

    inboxLib.getUserInbox(user, { asArray: false }),
  ]);

  userData.inbox.messages = messages;

  _(tasks)
    .map(task => task.toJSON())
    .groupBy(task => task.type)
    .forEach((tasksPerType, taskType) => {
      userData.tasks[`${taskType}s`] = tasksPerType;
    });

  return userData;
}

/**
 * @api {get} /export/userdata.json Export user data in JSON format
 * @apiName ExportUserDataJson
 * @apiGroup DataExport
 *
 * @apiSuccess {JSON} File A JSON file of the user object and tasks.
 */
api.exportUserDataJson = {
  method: 'GET',
  url: '/export/userdata.json',
  middlewares: [authWithSession],
  async handler (req, res) {
    const userData = await _getUserDataForExport(res.locals.user);

    res.set({
      'Content-Type': 'application/json',
      'Content-disposition': 'attachment; filename=habitica-user-data.json',
    });
    const jsonRes = JSON.stringify(userData);

    res.status(200).send(jsonRes);
  },
};

/**
 * @api {get} /export/userdata.xml Export user data in XML format
 * @apiName ExportUserDataXml
 * @apiDescription This XML export feature is not currently working (https://github.com/HabitRPG/habitica/issues/10100).
 * @apiGroup DataExport
 *
 * @apiSuccess {XML} File An xml file of the user object.
 */
api.exportUserDataXml = {
  method: 'GET',
  url: '/export/userdata.xml',
  middlewares: [authWithSession],
  async handler (req, res) {
    const userData = await _getUserDataForExport(res.locals.user);
    const xmlData = marshallUserData(userData);

    res.set({
      'Content-Type': 'text/xml',
      'Content-disposition': 'attachment; filename=habitica-user-data.xml',
    });
    res.status(200).send(xmlData);
  },
};

/**
 * @api {get} /export/avatar-:uuid.html Render a user avatar as an HTML page
 * @apiName ExportUserAvatarHtml
 * @apiDescription This HTML export feature is not currently working (https://github.com/HabitRPG/habitica/issues/9489).
 * @apiGroup DataExport
 *
 * @apiParam (Path) {String} uuid The User ID of the user
 *
 * @apiSuccess {HTML} File An html page rendering the user's avatar.
 *
 * @apiUse UserNotFound
 */
// @TODO fix
api.exportUserAvatarHtml = {
  method: 'GET',
  url: '/export/avatar-:memberId.html',
  // middlewares: [locals],
  async handler (/* req, res */) {
    throw new NotFound('This API route is currently not available. See https://github.com/HabitRPG/habitica/issues/9489.');

    /* req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { memberId } = req.params;

    throw new NotFound('This API route is currently not available. See https://github.com/HabitRPG/habitica/issues/9489.');

    const member = await User
      .findById(memberId)
      .select('stats profile items achievements preferences backer contributor')
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', { userId: memberId }));
    res.render('avatar-static', {
      title: member.profile.name,
      env: _.defaults({ user: member }, res.locals.habitrpg),
    }); */
  },
};

/**
 * @api {get} /export/avatar-:uuid.png Render a user avatar as a PNG file
 * @apiName ExportUserAvatarPng
 * @apiDescription This PNG export feature is not currently working (https://github.com/HabitRPG/habitica/issues/9489).
 * @apiGroup DataExport
 *
 * @apiParam (Path) {String} uuid The User ID of the user
 *
 * @apiSuccess {PNG} File A png file of the user's avatar.
 */
api.exportUserAvatarPng = {
  method: 'GET',
  url: '/export/avatar-:memberId.png',
  async handler (/* req, res */) {
    throw new NotFound('This API route is currently not available. See https://github.com/HabitRPG/habitica/issues/9489.');

    /* req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    const validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    const { memberId } = req.params;

    const filename = `avatars/${memberId}.png`;
    const s3url = `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`;

    let response;
    try {
      response = await got.head(s3url); // TODO add timeout and retries
    } catch (gotError) {
      // If the file does not exist AWS S3 can return a 403 error
      if (gotError.code !== 'ENOTFOUND' && gotError.statusCode
      !== 404 && gotError.statusCode !== 403) {
        throw gotError;
      }
    }

    // cache images for 30 minutes on aws, else upload a new one
    if (response && response.statusCode === 200 && moment()
    .diff(response.headers['last-modified'], 'minutes') < 30) {
      return res.redirect(s3url);
    }

    const pageBuffer = await new Pageres()
      .src(`${BASE_URL}/export/avatar-${memberId}.html`, ['140x147'], {
        crop: true,
        filename: filename.replace('.png', ''),
      })
      .run();

    const s3upload = S3.upload({
      Bucket: S3_BUCKET,
      Key: filename,
      ACL: 'public-read',
      StorageClass: 'REDUCED_REDUNDANCY',
      ContentType: 'image/png',
      Expires: moment().add({ minutes: 5 }).toDate(),
      Body: pageBuffer,
    });

    const s3res = await new Promise((resolve, reject) => {
      s3upload.send((err, s3uploadRes) => {
        if (err) {
          reject(err);
        } else {
          resolve(s3uploadRes);
        }
      });
    });

    return res.redirect(s3res.Location); */
  },
};

/**
 * @api {get} /export/inbox.html Export user private messages as HTML document
 * @apiName ExportUserPrivateMessages
 *
 * @apiGroup DataExport
 *
 * @apiSuccess {HTML} File An html page of the user's private messages.
 */
api.exportUserPrivateMessages = {
  method: 'GET',
  url: '/export/inbox.html',
  middlewares: [authWithSession],
  async handler (req, res) {
    const { user } = res.locals;

    const timezoneUtcOffset = user.getUtcOffset();
    const dateFormat = user.preferences.dateFormat.toUpperCase();
    const TO = res.t('to');
    const FROM = res.t('from');

    const inbox = await inboxLib.getUserInbox(user);

    let messages = '<!DOCTYPE html><html><head></head><body>';

    inbox.forEach((message, index) => {
      const recipientLabel = message.sent ? TO : FROM;
      const messageUser = message.user;
      const timestamp = moment.utc(message.timestamp).utcOffset(timezoneUtcOffset).format(`${dateFormat} HH:mm:ss`);
      const text = md.render(message.text);
      const pageIndex = `(${index + 1}/${inbox.length})`;
      messages += `
      <p>
        ${recipientLabel} <strong>${messageUser}</strong> ${timestamp}
        ${pageIndex}
        <br />
        ${text}
      </p>
      <hr />`;
    });

    messages += '</body></html>';

    res.set({
      'Content-Type': 'text/html',
      'Content-disposition': 'attachment; filename=inbox.html',
    });

    res.status(200).send(messages);
  },
};

export default api;
