/*
 * API description-specific refract elements.
 * General structure:
 *
 * + Category - API, resource group
 *   + Category
 *   + Copy
 *   + Resource
 *     + Transition
 *       + Transaction
 *         + Request
 *           + Asset
 *           + Message body
 *           + Message body schema
 *         + Response
 *           + Asset
 *           + Message body
 *           + Message body schema
 *   + Transition
 *   + Data structure
 */

export function namespace(options) {
  require('./elements/http-headers')(options.base);
  require('./elements/href-variables')(options.base);
  require('./elements/asset')(options.base);
  require('./elements/http-message-payload')(options.base);
  require('./elements/auth-scheme')(options.base);
  require('./elements/http-transaction')(options.base);
  require('./elements/transition')(options.base);
  require('./elements/resource')(options.base);
  require('./elements/data-structure')(options.base);
  require('./elements/copy')(options.base);
  require('./elements/category')(options.base);
}

export default {namespace};
