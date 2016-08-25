import _ from 'lodash';

export default function buildUriTemplate(basePath, href, pathObjectParameters = [], queryParameters = []) {
  if (queryParameters.length > 0 || pathObjectParameters.length > 0) {
    // Path object parameters apply to all nested resources (operations). Only
    // the ones marked as query parameters are relevant though
    const pathObjectParameterNames = pathObjectParameters
      .filter(parameter => parameter.in === 'query')
      .map(parameter => parameter.name);

    const queryParameterNames = queryParameters.map(parameter => {
      return parameter.name;
    });

    // There can be duplicate parameter names, so we need the unique list
    const parameterNames = _.uniq([].concat(pathObjectParameterNames, queryParameterNames));
    const parameterNamesString = parameterNames.length ? `{?${parameterNames.join(',')}}` : '';

    const full = `${basePath}${href}${parameterNamesString}`;

    // Before returning, we replace instances of `-` with `%2d`, but only when
    // they occur inside of a template variable.
    return full.replace(/\{.*?\}/g, (match) => {
      return match.replace('-', '%2d');
    });
  }

  return basePath + href;
}
