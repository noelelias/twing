const {iteratorToHash} = require('../../../../../../dist/cjs/lib/helpers/iterator-to-hash');

const tap = require('tape');

class Foo {

}

tap.test('iterator-to-array', function (test) {
    let obj = {foo: 'bar'};

    test.equals(iteratorToHash(obj), obj);

    let foo = new Foo();

    test.equals(iteratorToHash(foo), foo);

    test.end();
});
