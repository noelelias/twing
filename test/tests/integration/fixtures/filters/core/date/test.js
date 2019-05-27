const TwingTestIntegrationTestCaseBase = require('../../../../../../integration-test-case');

let Luxon = require('luxon');

module.exports = class extends TwingTestIntegrationTestCaseBase {
    getDescription() {
        return '"date" filter';
    }

    getTemplates() {
        let templates = super.getTemplates();

        templates.set('index.twig', require('./index.twig'));

        return templates;
    }

    getExpected() {
        return require('./expected.html');
    }

    getData() {
        Luxon.Settings.defaultZoneName = 'Europe/Paris';

        return {
            date1: Luxon.DateTime.fromObject({year: 2010, month: 10, day: 4, hour: 13, minute: 45}),
            date2: Luxon.DateTime.fromObject({year: 2010, month: 10, day: 4, hour: 13, minute: 45}),
            date3: '2010-10-04 13:45',
            date4: 1286199900,
            date5: -189291360,
            date6: Luxon.DateTime.fromObject({year: 2010, month: 10, day: 4, hour: 13, minute: 45, zone: 'America/New_York'}),
            date7: '2010-01-28T15:00:00+04:00',
            timezone1: 'America/New_York',
        }
    }
};
