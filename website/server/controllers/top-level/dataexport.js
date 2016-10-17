import { authWithSession } from '../../middlewares/auth';
import { model as User } from '../../models/user';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/errors';
import _ from 'lodash';
import csvStringify from '../../libs/csvStringify';
import moment from 'moment';
import js2xml from 'js2xmlparser';
import Pageres from 'pageres';
import nconf from 'nconf';
import got from 'got';
import Bluebird from 'bluebird';
import locals from '../../middlewares/locals';
import md from 'habitica-markdown';
import {
  S3,
} from '../../libs/aws';

const S3_BUCKET = nconf.get('S3:bucket');

const BASE_URL = nconf.get('BASE_URL');

let api = {};

/**
 * @apiDefine DataExport Data Export
 * These routes allow you to download backups of your data.
 *
 * **Note:** They are intented to be used on the website only and as such are part of the private API and may change at any time.
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
    let user = res.locals.user;

    let tasks = await Tasks.Task.find({
      userId: user._id,
      type: {$in: ['habit', 'daily']},
    }).exec();

    let output = [
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

    let csvRes = await csvStringify(output);
    res.status(200).send(csvRes);
  },
};

// Convert user to json and attach tasks divided by type
// at user.tasks[`${taskType}s`] (user.tasks.{dailys/habits/...})
async function _getUserDataForExport (user) {
  let userData = user.toJSON();
  userData.tasks = {};

  let tasks = await Tasks.Task.find({
    userId: user._id,
  }).exec();

  tasks = _.chain(tasks)
    .map(task => task.toJSON())
    .groupBy(task => task.type)
    .each((tasksPerType, taskType) => {
      userData.tasks[`${taskType}s`] = tasksPerType;
    })
    .value();

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
    let userData = await _getUserDataForExport(res.locals.user);

    res.set({
      'Content-Type': 'application/json',
      'Content-disposition': 'attachment; filename=habitica-user-data.json',
    });
    let jsonRes = JSON.stringify(userData);

    res.status(200).send(jsonRes);
  },
};

/**
 * @api {get} /export/userdata.xml Export user data in XML format
 * @apiName ExportUserDataXml
 * @apiGroup DataExport
 *
 * @apiSuccess {XML} File An xml file of the user object.
 */
api.exportUserDataXml = {
  method: 'GET',
  url: '/export/userdata.xml',
  middlewares: [authWithSession],
  async handler (req, res) {
    let userData = await _getUserDataForExport(res.locals.user);

    res.set({
      'Content-Type': 'text/xml',
      'Content-disposition': 'attachment; filename=habitica-user-data.xml',
    });
    res.status(200).send(js2xml('user', userData));
  },
};

/**
 * @api {get} /export/avatar-:uuid.html Render a user avatar as an HTML page
 * @apiName ExportUserAvatarHtml
 * @apiGroup DataExport
 *
 * @apiParam (Path) {String} uuid The User ID of the user
 *
 * @apiSuccess {HTML} File An html page rendering the user's avatar.
 *
 * @apiUse UserNotFound
 */
api.exportUserAvatarHtml = {
  method: 'GET',
  url: '/export/avatar-:memberId.html',
  middlewares: [locals],
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;
    let member = await User
      .findById(memberId)
      .select('stats profile items achievements preferences backer contributor')
      .exec();

    if (!member) throw new NotFound(res.t('userWithIDNotFound', {userId: memberId}));
    res.render('avatar-static', {
      title: member.profile.name,
      env: _.defaults({user: member}, res.locals.habitrpg),
    });
  },
};

/**
 * @api {get} /export/avatar-:uuid.png Render a user avatar as a PNG file
 * @apiName ExportUserAvatarPng
 * @apiGroup DataExport
 *
 * @apiParam (Path) {String} uuid The User ID of the user
 *
 * @apiSuccess {PNG} File A png file of the user's avatar.
 */
api.exportUserAvatarPng = {
  method: 'GET',
  url: '/export/avatar-:memberId.png',
  async handler (req, res) {
    req.checkParams('memberId', res.t('memberIdRequired')).notEmpty().isUUID();

    let validationErrors = req.validationErrors();
    if (validationErrors) throw validationErrors;

    let memberId = req.params.memberId;

    let filename = `avatars/${memberId}.png`;
    let s3url = `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`;

    let response;
    try {
      response = await got.head(s3url);
    } catch (gotError) {
      // If the file does not exist AWS S3 can return a 403 error
      if (gotError.code !== 'ENOTFOUND' && gotError.statusCode !== 404 && gotError.statusCode !== 403) {
        throw gotError;
      }
    }

    // cache images for 30 minutes on aws, else upload a new one
    if (response && response.statusCode === 200 && moment().diff(response.headers['last-modified'], 'minutes') < 30) {
      return res.redirect(s3url);
    }

    let [stream] = await new Pageres()
    .src(`${BASE_URL}/export/avatar-${memberId}.html`, ['140x147'], {
      crop: true,
      filename: filename.replace('.png', ''),
    })
    .run();

    let s3upload = S3.upload({
      Bucket: S3_BUCKET,
      Key: filename,
      ACL: 'public-read',
      StorageClass: 'REDUCED_REDUNDANCY',
      ContentType: 'image/png',
      Expires: moment().add({minutes: 5}).toDate(),
      Body: stream,
    });

    let s3res = await new Bluebird((resolve, reject) => {
      s3upload.send((err, s3uploadRes) => {
        if (err) {
          reject(err);
        } else {
          resolve(s3uploadRes);
        }
      });
    });

    res.redirect(s3res.Location);
  },
};

/**
 * @api {get} /export/inbox.html Export user private messages as HTML document
 * @apiName ExportUserPrivateMessages
 * @apiGroup DataExport
 *
 * @apiSuccess {HTML} File An html page of the user's private messages.
 */
api.exportUserPrivateMessages = {
  method: 'GET',
  url: '/export/inbox.html',
  middlewares: [authWithSession],
  async handler (req, res) {
    let user = res.locals.user;

    const timezoneOffset = user.preferences.timezoneOffset;
    const dateFormat = user.preferences.dateFormat.toUpperCase();
    const TO = res.t('to');
    const FROM = res.t('from');

    let inbox = Object.keys(user.inbox.messages).map(key => user.inbox.messages[key]);

    inbox = _.sortBy(inbox, function sortBy (num) {
      return num.sort * -1;
    });

    let messages = '<!DOCTYPE html><html><head></head><body>';

    inbox.forEach((message, index) => {
      let recipientLabel = message.sent ? TO : FROM;
      let messageUser = message.user;
      let timestamp = moment.utc(message.timestamp).zone(timezoneOffset).format(`${dateFormat} HH:mm:ss`);
      let text = md.render(message.text);
      index = `(${index + 1}/${inbox.length})`;
      messages += `
      <p>
        ${recipientLabel} <strong>${messageUser}</strong> ${timestamp}
        ${index}
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

module.exports = api;
