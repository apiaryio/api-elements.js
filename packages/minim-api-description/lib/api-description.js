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
 *     + Enumeration
 */

const httpHeaders = require('./elements/http-headers');
const hrefVariables = require('./elements/href-variables');
const asset = require('./elements/asset');
const httpMessagePayload = require('./elements/http-message-payload');
const authScheme = require('./elements/auth-scheme');
const httpTransaction = require('./elements/http-transaction');
const transition = require('./elements/transition');
const resource = require('./elements/resource');
const dataStructure = require('./elements/data-structure');
const copy = require('./elements/copy');
const category = require('./elements/category');
const extension = require('./elements/extension');
const enumeration = require('./elements/enum');
const defineValueOf = require('./define-value-of');

const namespace = (options) => {
  enumeration(options.base);
  defineValueOf(options.base);
  httpHeaders(options.base);
  hrefVariables(options.base);
  asset(options.base);
  httpMessagePayload(options.base);
  authScheme(options.base);
  httpTransaction(options.base);
  transition(options.base);
  resource(options.base);
  dataStructure(options.base);
  copy(options.base);
  category(options.base);
  extension(options.base);
};

module.exports = { namespace };
