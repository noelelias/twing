const {getAttribute} = require('../../../../../../dist/cjs/lib/helpers/get-attribute');
const {TwingEnvironment, TwingLoaderNull, TwingTemplate, TwingErrorRuntime, TwingSource} = require('../../../../../../dist/cjs/main');
const TwingTestMockEnvironment = require('../../../../../mock/environment');
const TwingTestMockLoader = require('../../../../../mock/loader');

const tape = require('tape');

class Foo {
    constructor() {
        this.oof = 'oof';
    }

    foo() {
        return 'foo';
    }

    getFoo() {
        return 'getFoo';
    }

    getBar() {
        return 'getBar';
    }

    isBar() {
        return 'isBar';
    }

    hasBar() {
        return 'hasBar';
    }

    isOof() {
        return 'isOof';
    }

    hasFooBar() {
        return 'hasFooBar';
    }

    __call() {

    }
}

class TwingTestExtensionCoreTemplate extends TwingTemplate {
    constructor(env) {
        super(env);
    }
}

tape.test('get-attribute', (test) => {
    let env = new TwingTestMockEnvironment(new TwingTestMockLoader(), {
        strict_variables: true
    });

    let source = new TwingSource('', '');

    test.test('should support method calls', function (test) {
        let foo = new Foo();

        // object property
        test.same(getAttribute(env, new Foo(), 'oof', TwingTemplate.ANY_CALL, [], true), true);
        test.same(getAttribute(env, new Foo(), 'oof', TwingTemplate.ANY_CALL, [], false), 'oof');

        test.same(getAttribute(env, foo, 'foo'), 'foo', 'should resolve methods by their name');
        test.same(getAttribute(env, foo, 'bar'), 'getBar', 'should resolve get{name} if {name} doesn\'t exist');
        test.same(getAttribute(env, foo, 'Oof'), 'isOof', 'should resolve is{name} if {name} and get{name} don\'t exist');
        test.same(getAttribute(env, foo, 'fooBar'), 'hasFooBar', 'should resolve has{name} if {name}, get{name} and is{name} don\'t exist');

        test.same(getAttribute(env, foo, 'getfoo'), 'getFoo', 'should resolve method in a case-insensitive way');
        test.same(getAttribute(env, foo, 'GeTfOo'), 'getFoo', 'should resolve method in a case-insensitive way');

        // !METHOD_CALL + boolean item
        test.same(getAttribute(env, new Map([[0, 2], [1, 3]]), false), 2);
        test.same(getAttribute(env, new Map([[0, 2], [1, 3]]), true), 3);

        // !METHOD_CALL + float item
        test.same(getAttribute(env, new Map([[0, 2], [1, 3]]), 0.1), 2);
        test.same(getAttribute(env, new Map([[0, 2], [1, 3]]), 1.1), 3);

        try {
            getAttribute(env, new Map(), 0);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Index "0" is out of bounds as the array is empty.');
        }

        try {
            getAttribute(env, new Map([[0, 1]]), 1);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Index "1" is out of bounds for array [1].');
        }

        test.throws(function () {
            getAttribute(env, new Map(), 'foo');
        }, new TwingErrorRuntime('Impossible to access a key ("foo") on a object variable ("[object Map]").', -1, source));

        test.throws(function () {
            getAttribute(env, null, 'foo', [], TwingTemplate.ARRAY_CALL);
        }, new TwingErrorRuntime('Impossible to access a key ("foo") on a null variable.', -1, source));

        test.throws(function () {
            getAttribute(env, 5, 'foo', [], TwingTemplate.ARRAY_CALL);
        }, new TwingErrorRuntime('Impossible to access a key ("foo") on a number variable ("5").', -1, source));

        test.throws(function () {
            getAttribute(env, null, 'foo', [], TwingTemplate.ANY_CALL);
        }, new TwingErrorRuntime('Impossible to access an attribute ("foo") on a null variable.', -1, source));

        // METHOD_CALL
        test.equals(getAttribute(env, 5, 'foo', [], TwingTemplate.METHOD_CALL, true), false);
        test.equals(getAttribute(env, 5, 'foo', [], TwingTemplate.METHOD_CALL, false, true), undefined);

        test.throws(function () {
            getAttribute(env, null, 'foo', [], TwingTemplate.METHOD_CALL);
        }, new TwingErrorRuntime('Impossible to invoke a method ("foo") on a null variable.', -1, source));

        test.throws(function () {
            getAttribute(env, 5, 'foo', [], TwingTemplate.METHOD_CALL);
        }, new TwingErrorRuntime('Impossible to invoke a method ("foo") on a number variable ("5").', -1, source));

        try {
            getAttribute(env, new Map(), 'foo', [], TwingTemplate.METHOD_CALL);

            test.fail();
        } catch (e) {
            test.same(e.message, 'Impossible to invoke a method ("foo") on an array.');
        }

        test.throws(function () {
            getAttribute(env, new TwingTestExtensionCoreTemplate(env), 'foo');
        }, new TwingErrorRuntime('Accessing TwingTemplate attributes is forbidden.', -1));

        test.throws(function () {
            getAttribute(env, new Foo(), 'ooof', TwingTemplate.ANY_CALL, [], false, false);
        }, new TwingErrorRuntime('Neither the property "ooof" nor one of the methods ooof()" or "getooof()"/"isooof()"/"hasooof()" exist and have public access in class "Foo".', -1, source));

        // no strict_variables
        env = new TwingTestMockEnvironment(new TwingTestMockLoader(), {
            strict_variables: false
        });

        test.same(getAttribute(env, new Foo(), 'oof', TwingTemplate.ANY_CALL, [], false), 'oof');

        test.end();
    });

    test.test('sandboxed with non-allowed property', (test) => {
        let env = new TwingEnvironment(new TwingLoaderNull(), {
            sandboxed: true
        });

        class Obj {
            constructor() {
                this.foo = 'foo';
            }
        }

        try {
            getAttribute(env, new Obj(), 'foo', [], TwingTemplate.ANY_CALL, false, false, true);

            test.fail('should throw a security policy error.');
        } catch (e) {
            test.same(e.message, 'Calling "foo" property on a "Obj" is not allowed.');
        }

        test.end();
    });

    test.test('sandboxed with non-allowed method', (test) => {
        let env = new TwingEnvironment(new TwingLoaderNull(), {
            sandboxed: true
        });

        class Obj {
            foo() {

            }
        }

        try {
            getAttribute(env, new Obj(), 'foo', [], TwingTemplate.METHOD_CALL, false, false, true);

            test.fail('should throw a security policy error.');
        } catch (e) {
            test.same(e.message, 'Calling "foo" method on a "Obj" is not allowed.');
        }

        test.end();
    });

    test.end();
});