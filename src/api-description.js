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

import httpHeaders from './elements/http-headers';
import hrefVariables from './elements/href-variables';
import asset from './elements/asset';
import httpMessagePayload from './elements/http-message-payload';
import authScheme from './elements/auth-scheme';
import httpTransaction from './elements/http-transaction';
import transition from './elements/transition';
import resource from './elements/resource';
import dataStructure from './elements/data-structure';
import copy from './elements/copy';
import category from './elements/category';
import extension from './elements/extension';

export function namespace(options) {
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
}

export default { namespace };
