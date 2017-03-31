import _ from 'lodash';

export default function buildUriTemplate(basePath, href, pathObjectParams = [], queryParams = []) {
  if (queryParams.length > 0 || pathObjectParams.length > 0) {
    // Path object parameters apply to all nested resources (operations). Only
    // the ones marked as query parameters are relevant though
    const pathObjectParamNames = pathObjectParams
      .filter(parameter => parameter.in === 'query')
      .map(parameter => parameter.name);

    const queryParamNames = queryParams.map(parameter => parameter.name);

    // There can be duplicate parameter names, so we need the unique list
    const paramNames = _.uniq([].concat(pathObjectParamNames, queryParamNames));
    const paramNamesString = paramNames.length ? `{?${paramNames.join(',')}}` : '';

    const full = `${basePath}${href}${paramNamesString}`;

    // Before returning, we replace instances of `-` with `%2d`, but only when
    // they occur inside of a template variable.
    return full.replace(/\{.*?\}/g, match => match.replace('-', '%2d'));
  }

  return basePath + href;
}
