
// A map of messages used by the API/App that don't need to be translated and
// so are not placed into /common/locales

import _clone from 'lodash/clone';
import _template from 'lodash/template';

import messages from './../../errors/commonMessages';

export default function (msgKey, vars = {}) {
  let message = messages[msgKey];
  if (!message) throw new Error(`Error processing the common message "${msgKey}".`);

  let clonedVars = vars ? _clone(vars) : {};

  // TODO cache the result of template() ? More memory usage, faster output
  return _template(message)(clonedVars);
}
