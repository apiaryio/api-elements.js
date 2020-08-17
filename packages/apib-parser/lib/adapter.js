// API Blueprint parser for Fury.js

const deckardcain = require('deckardcain');

let drafter;

try {
  // eslint-disable-next-line import/no-unresolved, global-require
  drafter = require('protagonist');
} catch (error) {
  // eslint-disable-next-line global-require
  drafter = require('drafter.js');
}

const name = 'api-blueprint';
const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

function validate({ source, requireBlueprintName }) {
  const options = {
    requireBlueprintName,
  };

  return drafter.validate(source, options);
}

/*
 * Parse an API Blueprint into refract elements.
 */
function parse({
  source, generateSourceMap, generateMessageBody, generateMessageBodySchema,
  requireBlueprintName, namespace,
}) {
  const options = {
    exportSourcemap: !!generateSourceMap,
    generateMessageBody,
    generateMessageBodySchema,
    requireBlueprintName,
  };

  return drafter.parse(source, options).then((result) => {
    const parseResult = namespace.fromRefract(result);
    const isAnnotation = element => element.element === 'annotation';
    const { Link } = namespace.elements;

    if (!isAnnotation(parseResult.content[0])) {
      const link = new Link();

      link.title = 'Apiary Blueprint';
      link.relation = 'via';
      link.href = 'https://apiblueprint.org/';

      parseResult.links.push(link);
    }

    return parseResult;
  });
}

module.exports = {
  name,
  mediaTypes,
  detect,
  validate,
  parse,
};
