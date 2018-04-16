// A map of messages used by the API that don't need to be translated and
// so are not placed into /common/locales

import _ from 'lodash';
import messages from '../../common/errors/commonMessages';

export default function (msgKey, vars = {}) {
  let message = messages[msgKey];
  if (!message) throw new Error(`Error processing the API message "${msgKey}".`);

  let clonedVars = vars ? _.clone(vars) : {};

  // TODO cache the result of template() ? More memory usage, faster output
  return _.template(message)(clonedVars);
}
