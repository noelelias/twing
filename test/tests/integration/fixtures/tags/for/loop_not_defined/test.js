const TwingTestIntegrationTestCaseBase = require('../../../../../../integration-test-case');

module.exports = class extends TwingTestIntegrationTestCaseBase {
    getDescription() {
        return '"for" tag throws an error when accessing the last property with a condition';
    }

    getTemplates() {
        let templates = super.getTemplates();

        templates.set('index.twig', require('./index.twig'));

        return templates;
    }

    getExpectedErrorMessage() {
        return 'TwingErrorSyntax: The "loop.last" variable is not defined when looping with a condition in "index.twig" at line 3.'
    }

    getData() {
        return {
            items: [
                'a',
                'b'
            ]
        };
    }
};
