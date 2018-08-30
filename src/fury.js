#!/usr/bin/env node

import fs from 'fs';
import repl from 'repl';
import { isatty } from 'tty';
import yaml from 'js-yaml';
import commander from 'commander';
import { highlight } from 'cardinal';
import theme from 'cardinal/themes/tomorrow-night';
import JSON06Serialiser from 'minim/lib/serialisers/json-0.6';
import fury from 'fury';
import swagger from 'fury-adapter-swagger';
import apiBlueprintParser from 'fury-adapter-apib-parser';
import apiBlueprintSerializer from 'fury-adapter-apib-serializer';
import apiaryBlueprintParser from 'fury-adapter-apiary-blueprint-parser';
import pkg from '../package.json';

fury.use(swagger);
fury.use(apiBlueprintParser);
fury.use(apiBlueprintSerializer);
fury.use(apiaryBlueprintParser);

function isRefract(source) {
  let parseResult;

  try {
    parseResult = JSON.parse(source);
  } catch (error) {
    // NOOP
  }

  return parseResult && parseResult.element === 'parseResult';
}

class FuryCLI {
  constructor(inputPath, outputPath, outputFormat, validate, generateSourceMap, shell) {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.outputFormat = outputFormat;
    this.validate = validate;
    this.generateSourceMap = generateSourceMap;
    this.shell = shell;
  }

  run() {
    let source;

    if (this.inputPath === '-') {
      source = fs.readFileSync('/dev/stdin').toString();
    } else {
      source = fs.readFileSync(this.inputPath, 'utf8');
    }

    if (isRefract(source)) {
      const result = fury.minim.deserialise(JSON.parse(source));
      this.handleResult(result);
      return;
    }

    const options = {
      source,
      generateSourceMap: this.generateSourceMap,
    };

    const functionName = this.validate ? 'validate' : 'parse';

    fury[functionName](options, (err, result) => {
      if (result) {
        this.handleResult(result);
        return;
      }

      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  }

  handleResult(result) {
    if (this.shell) {
      repl.start('> ').context.parseResult = result;
    } else {
      this.serialize(result);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  validateResult(result) {
    if (result.warnings.length > 0 || result.errors.length > 0) {
      process.stderr.write('\n');
    }

    result.warnings.forEach((annotation) => {
      if (annotation.code) {
        process.stderr.write(`warning: (${annotation.code.toValue()})  ${annotation.toValue()}\n`);
      } else {
        process.stderr.write(`warning: ${annotation.toValue()}\n`);
      }
    });

    result.errors.forEach((annotation) => {
      if (annotation.code) {
        process.stderr.write(`error: (${annotation.code.toValue()})  ${annotation.toValue()}\n`);
      } else {
        process.stderr.write(`error: ${annotation.toValue()}\n`);
      }
    });

    if (result.errors.length > 0) {
      process.exit(1);
    }
  }

  serialize(result) {
    if (this.outputFormat === 'application/vnd.refract.parse-result+json') {
      const output = JSON.stringify(fury.minim.toRefract(result), null, 2);
      this.write(output, true);
      this.validateResult(result);
    } else if (this.outputFormat === 'application/vnd.refract.parse-result+yaml') {
      const output = yaml.dump(fury.minim.toRefract(result));
      this.write(output);
      this.validateResult(result);
    } else if (this.outputFormat === 'application/vnd.refract.parse-result+json; version=0.6') {
      const serialiser = new JSON06Serialiser(fury.minim);
      const output = JSON.stringify(serialiser.serialise(result), null, 2);
      this.write(output, true);
      this.validateResult(result);
    } else if (this.outputFormat === 'application/vnd.refract.parse-result+yaml; version=0.6') {
      const serialiser = new JSON06Serialiser(fury.minim);
      const output = yaml.dump(serialiser.serialise(result));
      this.write(output);
      this.validateResult(result);
    } else if (this.outputFormat === 'application/vnd.refract.parse-result+json; version=1.0') {
      const output = JSON.stringify(fury.minim.serialiser.serialise(result), null, 2);
      this.write(output, true);
      this.validateResult(result);
    } else if (this.outputFormat === 'application/vnd.refract.parse-result+yaml; version=1.0') {
      const output = yaml.dump(fury.minim.serialiser.serialise(result));
      this.write(output, true);
      this.validateResult(result);
    } else {
      fury.serialize({ api: result.api, mediaType: this.outputFormat }, (err, content) => {
        if (err) {
          console.error(err);
          process.exit(2);
        }

        this.write(content);
        this.validateResult(result);
      });
    }
  }

  write(output, json = false) {
    if (this.outputPath) {
      fs.writeFileSync(this.outputPath, output);
    } else if (isatty(process.stdout.fd) && json) {
      const highlighted = highlight(output, { json: true, theme });
      process.stdout.write(highlighted);
    } else {
      process.stdout.write(output);
    }
  }
}


if (require.main === module) {
  let input;
  let output;

  commander
    .description(pkg.description)
    .version(pkg.version)
    .option('-f, --format [format]', 'output format', 'application/vnd.refract.parse-result+json')
    .option('-l, --validate', 'validate input only')
    .option('-s, --sourcemap', 'Export sourcemaps into API Elements parse result')
    .option('--shell', 'Launch an interactive shell to interact with parse result')
    .option('--adapter [adapter]', 'Load a fury adapter')
    .arguments('<input> [output]')
    .action((inputArgument, outputArgument) => {
      input = inputArgument;
      output = outputArgument;
    });

  commander.parse(process.argv);

  if (input === undefined) {
    console.error('Input not given.');
    process.exit(3);
  }

  if (commander.adapter) {
    /* eslint-disable global-require */
    // eslint-disable-next-line import/no-dynamic-require
    fury.use(require(commander.adapter));
  }

  const furyCLI = new FuryCLI(input, output, commander.format,
    commander.validate, commander.sourcemap, commander.shell);
  furyCLI.run();
}
