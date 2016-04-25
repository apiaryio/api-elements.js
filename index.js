var fs = require('fs');
var glob = require('glob');
var path = require('path');

function getFixtures(subpath) {
  var fixtures = [];
  var filenames = glob.sync(path.join(__dirname, 'fixtures', subpath, 'swagger', '*.@(yaml|json)'));

  var apiElementsDir = path.join(__dirname, 'fixtures', subpath, 'api-elements');

  filenames.forEach(function (filename) {
    var name = path.basename(filename, path.extname(filename));
    var feature = {
      name: name
    };

    // We lazy load the data so that all the samples aren't just sitting in
    // memory.
    Object.defineProperty(feature, 'swagger', {
      get: function () {
        return fs.readFileSync(filename, 'utf8');
      }
    });

    Object.defineProperty(feature, 'apiElements', {
      get: function () {
        var apiElements = path.join(apiElementsDir, name + '.json');
        return require(apiElements);
      },
      set: function (value) {
        fs.writeFileSync(path.join(apiElementsDir, name + '.json'), JSON.stringify(value, null, 2), 'utf8');
        return value;
      }
    });

    Object.defineProperty(feature, 'apiElementsSourceMap', {
      get: function () {
        var apiElementsSourceMap = path.join(apiElementsDir, name + '.sourcemap.json');
        return require(apiElementsSourceMap);
      },
      set: function (value) {
        fs.writeFileSync(path.join(apiElementsDir, name + '.sourcemap.json'), JSON.stringify(value, null, 2), 'utf8');
        return value;
      }
    })

    fixtures.push(feature);
  });

  return fixtures;
}

// Get just the feature fixtures
exports.features = function () {
  return getFixtures('features');
}

// Get just the real world example fixtures
exports.examples = function () {
  return getFixtures('examples');
}

// Get all samples in one array
exports.samples = function () {
  return exports.features().concat(exports.examples());
}
