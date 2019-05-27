const TwingTestIntegrationTestCaseBase = require('../../../../../../integration-test-case');

module.exports = class extends TwingTestIntegrationTestCaseBase {
    getDescription() {
        return '"dump" function, xdebug is not loaded or xdebug <2.2-dev is loaded';
    }

    getTemplates() {
        let templates = super.getTemplates();

        templates.set('index.twig', require('./index.twig'));

        return templates;
    }

    getExpected() {
        return require('./expected.html');
    }

    getConfig() {
        return {
            debug: true,
            autoescape: false
        }
    }

    getData() {
        return {
            foo: 'foo',
            bar: 'bar'
        }
    }
};
