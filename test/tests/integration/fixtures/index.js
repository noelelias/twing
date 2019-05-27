const finder = require('fs-finder');
const path = require('path');

let directory = path.resolve('test/tests/integration/fixtures/functions/custom/async');

let files = finder.from(directory).findFiles('test.js');

module.exports = files;