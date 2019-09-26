const {
    TwingNodeBlockReference,
    TwingNodeType
} = require('../../../../../../dist/cjs/main');
const TwingTestMockCompiler = require('../../../../../mock/compiler');

const tap = require('tape');

tap.test('node/block-reference', function (test) {
    test.test('constructor', function (test) {
        let node = new TwingNodeBlockReference('foo', 1, 1);

        test.same(node.getAttribute('name'), 'foo');
        test.same(node.getType(), TwingNodeType.BLOCK_REFERENCE);

        test.end();
    });

    test.test('compile', function (test) {
        let node = new TwingNodeBlockReference('foo', 1, 1);
        let compiler = new TwingTestMockCompiler();

        test.same(compiler.compile(node).getSource(), `this.traceableDisplayBlock(1, this.source)(\'foo\', context.clone(), blocks);
`);

        test.end();
    });

    test.end();
});
