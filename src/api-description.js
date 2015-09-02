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
  for (const name of [
    'http-headers', 'href-variables', 'asset', 'http-message-payload',
    'http-transaction', 'transition', 'resource', 'data-structure',
    'copy', 'category',
  ]) {
    require(`./elements/${name}`)(options.base);
  }
}

export default {namespace};
