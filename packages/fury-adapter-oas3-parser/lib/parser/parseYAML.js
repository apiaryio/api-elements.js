/* eslint-disable no-use-before-define */

const yaml = require('yaml-js');
const { createWarning } = require('./annotations');

function extractSourceMap(node, namespace) {
  return new namespace.elements.SourceMap([
    [
      node.start_mark.pointer,
      node.end_mark.pointer - node.start_mark.pointer,
    ],
  ]);
}

function copySourceMap(node, element, namespace) {
  element.attributes.set('sourceMap', new namespace.elements.Array([extractSourceMap(node, namespace)]));
}

function yamlToObject(node, annotations, namespace) {
  return new namespace.elements.Object(node.value.map((nodes) => {
    const key = convert(nodes[0], annotations, namespace);
    const value = convert(nodes[1], annotations, namespace);
    return new namespace.elements.Member(key, value);
  }));
}

function yamlToArray(node, annotations, namespace) {
  return new namespace.elements.Array(node.value.map(nodes => convert(nodes, annotations, namespace)));
}

function convert(node, annotations, namespace) {
  let element;

  if (node.tag === 'tag:yaml.org,2002:map') {
    element = yamlToObject(node, annotations, namespace);
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:seq') {
    element = yamlToArray(node, annotations, namespace);
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:str') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:int' || node.tag === 'tag:yaml.org,2002:float') {
    element = new namespace.elements.Number(Number(node.value));
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:bool') {
    element = new namespace.elements.Boolean(Boolean(node.value));
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:null') {
    element = new namespace.elements.Null();
    copySourceMap(node, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:binary') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!binary as string', element));
  } else if (node.tag === 'tag:yaml.org,2002:timestamp') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!timestamp as string', element));
  } else if (node.tag === 'tag:yaml.org,2002:omap') {
    element = yamlToObject(node, annotations, namespace);
    copySourceMap(node, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!omap as object', element));
  } else if (node.tag === 'tag:yaml.org,2002:pairs') {
    element = yamlToObject(node, annotations, namespace);
    copySourceMap(node, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!pairs as object', element));
  } else if (node.tag === 'tag:yaml.org,2002:set') {
    element = yamlToArray(node, annotations, namespace);
    copySourceMap(node, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!set as array', element));
  } else {
    throw new Error('Unsupported YAML node');
  }

  return element;
}

function parse(source, namespace) {
  const parseResult = new namespace.elements.ParseResult();
  let ast;

  try {
    ast = yaml.compose(source);
  } catch (error) {
    const sourceMap = new namespace.elements.SourceMap([
      [error.context_mark.pointer, 1],
    ]);

    const annotation = new namespace.elements.Annotation(
      `YAML Syntax: ${error.context}`,
      { classes: ['error'] },
      { sourceMap: new namespace.elements.Array([sourceMap]) }
    );

    parseResult.push(annotation);
    return parseResult;
  }

  const annotations = [];

  const result = convert(ast, annotations, namespace);
  result.freeze();

  parseResult.push(result);
  parseResult.content = parseResult.content.concat(annotations);

  return parseResult;
}

module.exports = parse;
