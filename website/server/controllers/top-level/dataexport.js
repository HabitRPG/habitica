import { authWithSession } from '../../middlewares/api-v3/auth';
import { model as User } from '../../models/user';
import * as Tasks from '../../models/task';
import {
  NotFound,
} from '../../libs/api-v3/errors';
import _ from 'lodash';
import csvStringify from '../../libs/api-v3/csvStringify';
import moment from 'moment';
import js2xml from 'js2xmlparser';
import Pageres from 'pageres';
import nconf from 'nconf';
import got from 'got';
import Bluebird from 'bluebird';
import locals from '../../middlewares/api-v3/locals';
import {
  S3,
} from '../../libs/api-v3/aws';

const S3_BUCKET = nconf.get('S3:bucket');

const BASE_URL = nconf.get('BASE_URL');

let api = {};

/**
 * @api {get} /export/history.csv Export user tasks history in CSV format
 * @apiDescription History is only available for habits and dailys so todos and rewards won't be included. NOTE: Part of the private API that may change at any time.
 * @apiVersion 3.0.0
 * @apiName ExportUserHistory
 * @apiGroup DataExport
 *
 * @apiSuccess {string} A cvs file
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
 * @apiVersion 3.0.0
 * @apiName ExportUserDataJson
 * @apiGroup DataExport
 * @apiDescription NOTE: Part of the private API that may change at any time.
 *
 * @apiSuccess {string} A json file
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
 * @apiVersion 3.0.0
 * @apiName ExportUserDataXml
 * @apiGroup DataExport
 * @apiDescription NOTE: Part of the private API that may change at any time.
 *
 * @apiSuccess {string} A xml file
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
 * @apiVersion 3.0.0
 * @apiName ExportUserAvatarHtml
 * @apiGroup DataExport
 * @apiDescription NOTE: Part of the private API that may change at any time.
 *
 * @apiSuccess {string} An html page
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
 * @apiVersion 3.0.0
 * @apiName ExportUserAvatarPng
 * @apiGroup DataExport
 * @apiDescription NOTE: Part of the private API that may change at any time.
 *
 * @apiSuccess {string} A png file
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

module.exports = api;
