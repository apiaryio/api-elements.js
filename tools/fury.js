/*
  Example script to have Fury parse an API Blueprint.
*/
/* eslint no-var:0, func-names:0, no-console:0 no-process-exit:0 */
var async = require('async');
var fs = require('fs');
var path = require('path');
var parser = require('../lib/fury').legacyBlueprintParser;
var yargs = require('yargs')
  .usage('Usage: $0 [options] file|directory')
  .example('$0 --print example.apib', 'Process a file and print output')
  .example('$0 -r ./my/examples/', 'Process a directory (recursively)')
  .example('$0 ./my/examples/ --stats', 'Show processing stats')
  .options('b', {
    alias: 'benchmark',
    describe: 'Show file timing information',
    type: 'boolean',
    'default': false
  })
  .options('p', {
    alias: 'parallel',
    describe: 'Number of files to process in parallel',
    'default': 1
  })
  .options('print', {
    describe: 'Print parse result',
    type: 'boolean',
    'default': false
  })
  .options('r', {
    alias: 'recursive',
    describe: 'Enable directory recursion',
    type: 'boolean',
    'default': false
  })
  .options('stats', {
    describe: 'Show statistics on exit',
    type: 'boolean',
    'default': false
  })
  .options('s', {
    alias: 'stop',
    describe: 'Stop processing on first error',
    type: 'boolean',
    'default': false
  })
  .demand(1);

var exiting = false;
var stats = [];

// Process arguments
var args = yargs.argv;

// Utility functions
function sum(a, b) {
  return a + b;
}

function diff(a, b) {
  return a - b;
}

function nonError(item) {
  return !item.error;
}

function getDurationMs(duration) {
  return parseInt((duration[0] * 1000) + (duration[1] / 1000000), 10);
}

// Creates parsing functions to be run in series
function parse(filePath, done) {
  var data = fs.readFileSync(filePath, 'utf8');
  var start = process.hrtime();

  parser.parse({code: data}, function(error, api) {
    var ms = getDurationMs(process.hrtime(start));

    stats.push({
      fileSize: data.length,
      parseTime: ms,
      error: !!error
    });

    if (args.benchmark && !exiting) {
      console.error(filePath + ' (' + (data.length / 1024).toFixed(1) + 'KB) ' + ms + 'ms');
    }

    if (error) {
      // Add some info to the error.
      error.path = filePath;
      error.parseTime = ms;
      error.fileSize = data.length;

      if (args.stop) {
        return done(error);
      }

      console.error('Error processing: ' + filePath);
      console.error(error);
      return done();
    }

    // For debug puproses
    if (args.print) {
      console.error('Parse results:');
      console.log(JSON.stringify(api, null, 2));
    }

    done(null, ms);
  });
}

// Walk through a directory and process every in it file
function collectDirectory(dirPath) {
  var files = [];

  fs.readdirSync(dirPath).forEach(function(name) {
    var filePath = path.join(dirPath, name);
    var fstat = fs.statSync(filePath);
    if (fstat.isFile() && (path.extname(filePath) === '.apib'
                          || path.extname(filePath) === '.md')) {
      files.push(filePath);
    } else if (fstat.isDirectory() && args.recursive) {
      files = files.concat(collectDirectory(filePath));
    }
  });

  return files;
}

// Print statistics on processed files.
function printStats(startTime) {
  var Table = require('cli-table');
  var ms = getDurationMs(process.hrtime(startTime));

  var parseTimes = stats.filter(nonError).map(function(item) {
    return item.parseTime;
  }).sort(diff);

  var fileSizes = stats.filter(nonError).map(function(item) {
    return item.fileSize;
  }).sort(diff);

  var errorCount = stats.filter(function(item) {
    return item.error;
  }).length;

  var overviewTable = new Table({
    colAligns: ['left', 'right'],
    style: {
      head: ['cyan']
    }
  });

  var timingTable = new Table({
    head: ['', 'Parse time (ms)', 'File size (KB)'],
    colAligns: ['left', 'right', 'right'],
    style: {
      head: ['cyan']
    }
  });

  overviewTable.push(
    {'Total time processing': ms + 'ms'},
    {'Files successfully processed': stats.length - errorCount},
    {'Errors encountered': errorCount},
    {'Blueprints per second': parseInt((stats.length - errorCount) / ms * 1000, 10)},
    {'Concurrency': args.parallel}
  );

  timingTable.push({
    'Mean': [
      parseInt(parseTimes.reduce(sum) / parseTimes.length, 10),
      (fileSizes.reduce(sum) / fileSizes.length / 1024).toFixed(1)
    ]
  }, {
    'P90': [
      parseTimes[parseInt(parseTimes.length * 0.9, 10)],
      (fileSizes[parseInt(fileSizes.length * 0.9, 10)] / 1024).toFixed(1)
    ]
  }, {
    'P99': [
      parseTimes[parseInt(parseTimes.length * 0.99, 10)],
      (fileSizes[parseInt(fileSizes.length * 0.99, 10)] / 1024).toFixed(1)
    ]
  });

  console.error(overviewTable.toString());
  console.error(timingTable.toString());
}

// Query input and process file(s)
function main() {
  var startTime = process.hrtime();
  var series = [];
  var fstat = fs.statSync(args._[0]);

  process.on('SIGINT', function() {
    if (!exiting) {
      console.log('');
      printStats(startTime);
    }
    process.exit(1);
  });

  if (fstat.isFile()) {
    series.push(args._[0]);
  } else if (fstat.isDirectory()) {
    series = collectDirectory(args._[0]);
  }

  console.error('Processing ' + series.length + ' file(s)');
  async.eachLimit(series, args.parallel, parse, function(error) {
    if (error) {
      exiting = true;
      console.error('Error processing: ' + error.path);
      console.error(error);
      if (error.stack) {
        console.error(error.stack);
      }
      console.error('Cleaning up and exiting...');
    } else {
      console.error('Done.');
    }

    if (args.stats) {
      printStats(startTime);
    }

    // Cancel any in-progress threads
    if (error) {
      process.exit(1);
    }
  });
}

main();
