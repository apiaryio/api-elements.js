var fs = require('fs');
var path = require('path');
var parser = require('../lib/fury').legacyBlueprintParser;
var async = require('async');

// TODO: Turn into a CLI argument
var PRINT_PARSE_RESULT = false;
var BREAK_ON_ERROR = false;

// Process arguments
var args = process.argv.slice(2);
if (typeof args == 'undefined' || args.length !== 1) {
  var scriptName = path.basename(process.argv[1]);
  console.log('usage: ' + scriptName + ' <input file>|<input directory>\n');
  process.exit(0);
}

// Creates parsing functions to be run in series
function createParseFunction(filePath) {
  return function(callback) {
    var data = fs.readFileSync(filePath, 'utf8');
    console.log('processing ' + filePath + ' ...');
    parser.parse({ code: data }, function(error, api, warnings) {
      if (error) {
        if (BREAK_ON_ERROR) {
          return callback(error);
        }
        else {
          console.log(JSON.stringify(error, null, 2));
          return callback();
        }
      }

      // For debug puproses
      if (PRINT_PARSE_RESULT) {
        console.log('Parse results:');
        console.log(JSON.stringify(api, null, 2));
      }
      return callback();
    });
  };
}

// Walk through a directory and process every in it file
function collectDirectory(dirPath) {
  var parseFunctions = [];

  fs.readdirSync(dirPath).forEach(function(name) {
    var filePath = path.join(dirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile() && (path.extname(filePath) === '.apib'
                          || path.extname(filePath) === '.md')) {
      parseFunctions.push(createParseFunction(filePath));
    }
    // Do not recurse into directories for now
    // else if (stat.isDirectory()) {
    //     processDirectory(filePath, callback);
    // }
  });

  return parseFunctions;
}

// Query input
var series = [];
var stats = fs.statSync(args[0]);
if (stats.isFile()) {
  series.push(createParseFunction(args[0]));
} else if (stats.isDirectory()) {
  series = collectDirectory(args[0]);
}

console.log('processing ' + series.length + ' file(s)');
async.series(series, function(error) {
  if (error) {
    console.log(error);
  }

  console.log('\ndone.');
});
