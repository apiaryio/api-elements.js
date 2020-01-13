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

function yamlToObject(node, annotations, context) {
  if (node.value) {
    return new context.namespace.elements.Object(node.value.map((nodes) => {
      const key = convert(nodes[0], annotations, context);
      const value = convert(nodes[1], annotations, context);
      return new context.namespace.elements.Member(key, value);
    }));
  }

  return new context.namespace.elements.Object();
}

function yamlToArray(node, annotations, context) {
  if (node.value) {
    return new context.namespace.elements.Array(node.value.map(nodes => convert(nodes, annotations, context)));
  }

  return new context.namespace.elements.Array();
}

function convert(node, annotations, context) {
  const { namespace } = context;

  let element;
  if (node.tag === 'tag:yaml.org,2002:map') {
    element = yamlToObject(node, annotations, context);
  } else if (node.tag === 'tag:yaml.org,2002:seq') {
    element = yamlToArray(node, annotations, context);
  } else if (node.tag === 'tag:yaml.org,2002:str') {
    element = new namespace.elements.String(node.value);
  } else if (node.tag === 'tag:yaml.org,2002:int' || node.tag === 'tag:yaml.org,2002:float') {
    element = new namespace.elements.Number(Number(node.value));
  } else if (node.tag === 'tag:yaml.org,2002:bool') {
    element = new namespace.elements.Boolean(Boolean(node.value));
  } else if (node.tag === 'tag:yaml.org,2002:null') {
    element = new namespace.elements.Null();
  } else if (node.tag === 'tag:yaml.org,2002:binary') {
    element = new namespace.elements.String(node.value);
    const warning = createWarning(namespace, 'Interpreting YAML !!binary as string', element);
    copySourceMap(node.start_mark, node.end_mark, warning, namespace);
    annotations.push(warning);
  } else if (node.tag === 'tag:yaml.org,2002:timestamp') {
    element = new namespace.elements.String(node.value);
    const warning = createWarning(namespace, 'Interpreting YAML !!timestamp as string', element);
    copySourceMap(node.start_mark, node.end_mark, warning, namespace);
    annotations.push(warning);
  } else if (node.tag === 'tag:yaml.org,2002:omap') {
    element = yamlToObject(node, annotations, context);
    const warning = createWarning(namespace, 'Interpreting YAML !!omap as object', element);
    copySourceMap(node.start_mark, node.end_mark, warning, namespace);
    annotations.push(warning);
  } else if (node.tag === 'tag:yaml.org,2002:pairs') {
    element = yamlToObject(node, annotations, context);
    const warning = createWarning(namespace, 'Interpreting YAML !!pairs as object', element);
    copySourceMap(node.start_mark, node.end_mark, warning, namespace);
    annotations.push(warning);
  } else if (node.tag === 'tag:yaml.org,2002:set') {
    element = yamlToArray(node, annotations, context);
    const warning = createWarning(namespace, 'Interpreting YAML !!set as array', element);
    copySourceMap(node.start_mark, node.end_mark, warning, namespace);
    annotations.push(warning);
  } else {
    throw new Error(`Unsupported YAML node '${node.tag}'`);
  }

  copySourceMap(node.start_mark, node.end_mark, element, namespace);

  return element;
}

function parse(source, context) {
  const { namespace } = context;
  const parseResult = new namespace.elements.ParseResult();
  let ast;

  try {
    ast = yaml.compose(source);
  } catch (error) {
    let message;

    if (error.problem) {
      const problem = error.problem.replace('\t', '\\t');
      message = `${problem}, ${error.context}`;
    } else if (error.context) {
      message = error.context;
    } else {
      ({ message } = error);
    }

    const annotation = new namespace.elements.Annotation(
      `YAML Syntax: ${message}`,
      { classes: ['error'] }
    );

    const marker = error.context_mark || error.problem_mark;
    if (marker) {
      copySourceMap(
        marker,
        marker,
        annotation,
        namespace
      );
    }

    parseResult.push(annotation);
    return parseResult;
  }

  const annotations = [];

  const result = convert(ast, annotations, context);

  parseResult.push(result);
  parseResult.content = parseResult.content.concat(annotations);

  return parseResult;
}

module.exports = parse;
