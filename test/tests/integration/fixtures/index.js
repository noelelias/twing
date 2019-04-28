const finder = require('fs-finder');
const path = require('path');

let directory = path.resolve('test/tests/integration/fixtures/tags/for');

let files = finder.from(directory).findFiles('test.js');

module.exports = files;