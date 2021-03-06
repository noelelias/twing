import TestBase from "../../TestBase";
import {TwingMarkup} from "../../../../../src/lib/markup";

class SplFileInfo {
    constructor(dirname: string) {

    }
}

// opendir returns a pointer in PHP
let opendir = function (dirname: string) {
    return {};
};

export default class extends TestBase {
    getDescription() {
        return 'Twig supports the in operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ bar in foo ? 'OK' : 'KO' }}
{{ not (bar in foo) ? 'KO' : 'OK' }}
{{ bar not in foo ? 'KO' : 'OK' }}
{{ 'a' in bar ? 'OK' : 'KO' }}
{{ 'c' not in bar ? 'OK' : 'KO' }}
{{ '' in bar ? 'OK' : 'KO' }}
{{ '' in '' ? 'OK' : 'KO' }}
{{ '0' not in '' ? 'OK' : 'KO' }}
{{ 'a' not in '0' ? 'OK' : 'KO' }}
{{ '0' in '0' ? 'OK' : 'KO' }}

{{ false in [0, 1] ? 'OK' : 'KO' }}
{{ true in [0, 1] ? 'OK' : 'KO' }}
{{ '0' in [0, 1] ? 'OK' : 'KO' }}
{{ '0' in [1, 0] ? 'OK' : 'KO' }}
{{ '' in [0, 1] ? 'OK' : 'KO' }}
{{ '' in [1, 0] ? 'OK' : 'KO' }}
{{ 0 in ['', 1] ? 'OK' : 'KO' }}
{{ 0 in [1, ''] ? 'OK' : 'KO' }}

{{ '' in 'foo' ? 'OK' : 'KO' }}
{{ 0 in 'foo' ? 'KO' : 'OK' }}
{{ false in 'foo' ? 'KO' : 'OK' }}
{{ false in '100' ? 'KO' : 'OK' }}
{{ true in '100' ? 'KO' : 'OK' }}

{{ [] in [true, false] ? 'OK' : 'KO' }}
{{ [] in [true, ''] ? 'KO' : 'OK' }}
{{ [] in [true, []] ? 'OK' : 'KO' }}

{{ resource ? 'OK' : 'KO' }}
{{ resource in 'foo'~resource ? 'KO' : 'OK' }}
{{ object in 'stdClass' ? 'KO' : 'OK' }}
{{ [] in 'Array' ? 'KO' : 'OK' }}
{{ dir_object in 'foo'~dir_object ? 'KO' : 'OK' }}

{{ ''~resource in resource ? 'KO' : 'OK' }}
{{ 'stdClass' in object ? 'KO' : 'OK' }}
{{ 'Array' in [] ? 'KO' : 'OK' }}
{{ ''~dir_object in dir_object ? 'KO' : 'OK' }}

{{ resource in [''~resource] ? 'KO' : 'OK' }}
{{ resource in [resource + 1 - 1] ? 'KO' : 'OK' }}
{{ dir_object in [''~dir_object] ? 'KO' : 'OK' }}

{{ 5 in 125 ? 'KO' : 'OK' }}
{{ 5 in '125' ? 'OK' : 'KO' }}
{{ '5' in 125 ? 'KO' : 'OK' }}
{{ '5' in '125' ? 'OK' : 'KO' }}

{{ 5.5 in 125.5 ? 'KO' : 'OK' }}
{{ 5.5 in '125.5' ? 'OK' : 'KO' }}
{{ '5.5' in 125.5 ? 'KO' : 'OK' }}

{{ safe in ['foo', 'bar'] ? 'OK' : 'KO' }}
{{ 'fo' in safe ? 'OK' : 'KO' }}`
        };
    }

    getExpected() {
        return `
OK
OK
OK
OK
OK
OK
OK
OK
OK
OK

OK
OK
OK
OK
OK
OK
OK
OK

OK
OK
OK
OK
OK

OK
OK
OK

OK
OK
OK
OK
OK

OK
OK
OK
OK

OK
OK
OK

OK
OK
OK
OK

OK
OK
OK

OK
OK
`;
    }

    getContext() {
        return {
            bar: 'bar',
            foo: {bar: 'bar'},
            dir_object: new SplFileInfo(__dirname),
            object: {},
            resource: opendir(__dirname),
            safe: new TwingMarkup('foo', 'UTF-8')
        }
    }
}
