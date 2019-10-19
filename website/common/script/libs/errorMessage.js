// errorMessage(key) will be called by all common-ops , which is also imported to the website

import _clone from 'lodash/clone';
import _template from 'lodash/template';

import messages from '../errors/commonErrorMessages';

export default function (msgKey, vars = {}) {
  const message = messages[msgKey];
  if (!message) throw new Error(`Error processing the common message "${msgKey}".`);

  const clonedVars = vars ? _clone(vars) : {};

  // TODO cache the result of template() ? More memory usage, faster output
  return _template(message)(clonedVars);
}
