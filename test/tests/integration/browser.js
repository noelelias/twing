const path = require('path');
const {Readable} = require('stream');

let fixtures = require('./fixtures');

let data = `const {TwingEnvironmentBrowser} = require('${path.resolve('build/lib/environment/browser')}');

let testCases = [
`;

for (let fixture of fixtures) {
    data += `    new (require('${path.dirname(fixture)}/test'))(),\n`;
}

data += `];

for (let testCase of testCases) {
    testCase.run(TwingEnvironmentBrowser);
}
`;

const stream = new Readable();

stream.push(data);
stream.push(null);
stream.pipe(process.stdout);
