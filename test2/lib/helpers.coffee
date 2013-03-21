utils = require('utils')

module.exports = ->
  baseUrl = 'http://localhost:3000'
  casper = require("casper").create
    clientScripts: 'lib/lodash.min.js'
  getModel = ->

  {
  casper: casper
  baseUrl: baseUrl
  playUrl: baseUrl + '/?play=1'
  utils: utils
  getModel: getModel
  }
