/* eslint-disable no-use-before-define */

const yaml = require('yaml-js');
const { createWarning } = require('./annotations');

function translateSourceMap(start, offset, startLine, startCol, endLine, endCol, namespace) {
  const begin = new namespace.elements.Number(start);
  const length = new namespace.elements.Number(offset);

  begin.attributes.set('line', startLine + 1);
  begin.attributes.set('column', startCol + 1);

  length.attributes.set('line', endLine + 1);
  length.attributes.set('column', endCol + 1);

  return new namespace.elements.Array([new namespace.elements.SourceMap([[begin, length]])]);
}

function copySourceMap(startMark, endMark, element, namespace) {
  element.attributes.set('sourceMap', translateSourceMap(
    startMark.pointer,
    endMark.pointer - startMark.pointer,
    startMark.line,
    startMark.column,
    endMark.line,
    endMark.column,
    namespace
  ));
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
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:seq') {
    element = yamlToArray(node, annotations, namespace);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:str') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:int' || node.tag === 'tag:yaml.org,2002:float') {
    element = new namespace.elements.Number(Number(node.value));
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:bool') {
    element = new namespace.elements.Boolean(Boolean(node.value));
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:null') {
    element = new namespace.elements.Null();
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
  } else if (node.tag === 'tag:yaml.org,2002:binary') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!binary as string', element));
  } else if (node.tag === 'tag:yaml.org,2002:timestamp') {
    element = new namespace.elements.String(node.value);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!timestamp as string', element));
  } else if (node.tag === 'tag:yaml.org,2002:omap') {
    element = yamlToObject(node, annotations, namespace);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!omap as object', element));
  } else if (node.tag === 'tag:yaml.org,2002:pairs') {
    element = yamlToObject(node, annotations, namespace);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
    annotations.push(createWarning(namespace, 'Interpreting YAML !!pairs as object', element));
  } else if (node.tag === 'tag:yaml.org,2002:set') {
    element = yamlToArray(node, annotations, namespace);
    copySourceMap(node.start_mark, node.end_mark, element, namespace);
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
    const annotation = new namespace.elements.Annotation(
      `YAML Syntax: ${error.context}`,
      { classes: ['error'] }
    );
    copySourceMap(
      error.context_mark,
      error.context_mark,
      annotation,
      namespace
    );
    parseResult.push(annotation);
    return parseResult;
  }

  const annotations = [];

  const result = convert(ast, annotations, namespace);

  parseResult.push(result);
  parseResult.content = parseResult.content.concat(annotations);

  return parseResult;
}

module.exports = parse;
