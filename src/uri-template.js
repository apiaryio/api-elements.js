import _ from 'underscore';

export default function buildUriTemplate(basePath, href, pathObjectParameters = [], queryParameters = []) {
  if (queryParameters.length > 0 || pathObjectParameters.length > 0) {
    // Path object parameters apply to all nested resources (operations). Only
    // the ones marked as query parameters are relevant though
    const pathObjectParameterNames = pathObjectParameters.filter(parameter => {
      return parameter.in === 'query';
    }).map(parameter => {
      return parameter.name;
    });

    const queryParameterNames = queryParameters.map(parameter => {
      return parameter.name;
    });

    // There can be duplicate parameter names, so we need the unique list
    const parameterNames = _.unique([].concat(pathObjectParameterNames, queryParameterNames));

    return basePath + href + '{?' + parameterNames.join(',') + '}';
  }

  return basePath + href;
}
