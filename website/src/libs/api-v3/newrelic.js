'use strict';

// We can't rely on babel here
// because the file is requested directly by the new relic module

const nconf = require('nconf');

// IMPORTANT remember to set the location of this file using the NEW_RELIC_HOME env variable
// more info here https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration

exports.config = {
  app_name: nconf.get('NEW_RELIC_APP_NAME'), // eslint-disable-line camelcase
  license_key: nconf.get('NEW_RELIC_LICENSE_KEY'), // eslint-disable-line camelcase
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info',
  },
};
