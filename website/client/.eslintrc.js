module.exports = {
  "rules": {
    "no-console": process.env.NODE_ENV === 'production' ? 2 : 0,
  },
  "extends": [
    "habitrpg/browser",
    "habitrpg/babel"
  ],
  "plugins": [
    "html"
  ]
}

