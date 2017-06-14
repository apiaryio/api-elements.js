import _ from 'lodash';

export default function buildUriTemplate(basePath, href, pathObjectParams = [], queryParams = []) {
  const parameterNames = _.chain(pathObjectParams)
    .concat(queryParams)
    .filter(parameter => parameter.in === 'query')
    .uniqBy(parameter => parameter.name)
    .map(parameter => parameter.name)
    .value();

  if (parameterNames.length > 0) {
    const queryString = parameterNames.join(',');
    const full = `${basePath}${href}{?${queryString}}`;

    // Before returning, we replace instances of `-` with `%2d`, but only when
    // they occur inside of a template variable.
    return full.replace(/\{.*?\}/g, match => match.replace('-', '%2d'));
  }

  return basePath + href;
}
