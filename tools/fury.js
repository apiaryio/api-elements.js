var fs = require('fs');
var path = require('path');
var parser = require('../lib/fury').legacyBlueprintParser;

// Process arguments
var args = process.argv.slice(2);
if (typeof args == 'undefined' || args.length !== 1) {
  var scriptName = path.basename(process.argv[1]);
  console.log('usage: ' + scriptName + ' <input file>\n');
  process.exit(0);
}

// Read & parse
fs.readFile(args[0], 'utf8', function (err, data) {
  if (err) throw err;

  parser.parse({ code: data }, function(error, api, warnings) {
    if (error) {
        console.log(JSON.stringify(error, null, 2));
        process.exit(error.code);
    }

    console.log(JSON.stringify(api, null, 2));
  });
});
