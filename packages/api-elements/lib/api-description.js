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

const HttpHeaders = require('./elements/HttpHeaders');
const HrefVariables = require('./elements/HrefVariables');
const Asset = require('./elements/Asset');
const HttpRequest = require('./elements/HttpRequest');
const HttpResponse = require('./elements/HttpResponse');
const AuthScheme = require('./elements/AuthScheme');
const HttpTransaction = require('./elements/HttpTransaction');
const Transition = require('./elements/Transition');
const Resource = require('./elements/Resource');
const DataStructure = require('./elements/DataStructure');
const Copy = require('./elements/Copy');
const Category = require('./elements/Category');
const Extension = require('./elements/Extension');
const Enum = require('./elements/Enum');
const defineValueOf = require('./define-value-of');

const namespace = (options) => {
  options.base
    .register('enum', Enum)
    .register('httpHeaders', HttpHeaders)
    .register('hrefVariables', HrefVariables)
    .register('asset', Asset)
    .register('httpRequest', HttpRequest)
    .register('httpResponse', HttpResponse)
    .register('authScheme', AuthScheme)
    .register('Basic Authentication Scheme', AuthScheme)
    .register('Token Authentication Scheme', AuthScheme)
    .register('OAuth2 Scheme', AuthScheme)
    .register('httpTransaction', HttpTransaction)
    .register('transition', Transition)
    .register('resource', Resource)
    .register('dataStructure', DataStructure)
    .register('copy', Copy)
    .register('category', Category)
    .register('extension', Extension);

  defineValueOf(options.base);
};

module.exports = { namespace };
