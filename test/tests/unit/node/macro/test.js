const TwingTestMockCompiler = require('../../../../mock/compiler');

const tap = require('tape');
const {TwingNodeMacro} = require("../../../../../build/node/macro");
const {TwingNodeText} = require("../../../../../build/node/text");
const {TwingNodeExpressionName} = require("../../../../../build/node/expression/name");
const {TwingNodeExpressionConstant} = require("../../../../../build/node/expression/constant");
const {TwingNodeType, TwingNode} = require("../../../../../build/node");

tap.test('node/macro', function (test) {
    test.test('constructor', function (test) {
        let body = new TwingNodeText('foo', 1, 1);

        let argumentsNode = new Map([
            [0, new TwingNodeExpressionName('foo', 1, 1)]
        ]);

        let arguments_ = new TwingNode(argumentsNode, new Map(), 1, 1);
        let node = new TwingNodeMacro('foo', body, arguments_, 1, 1);

        test.same(node.getNode('body'), body);
        test.same(node.getNode('arguments'), arguments_);
        test.same(node.getAttribute('name'), 'foo');
        test.same(node.getType(), TwingNodeType.MACRO);
        test.same(node.getTemplateLine(), 1);
        test.same(node.getTemplateColumn(), 1);

        test.end();
    });

    test.test('compile', function (test) {
        let body = new TwingNodeText('foo', 1, 1);

        let arguments_ = new TwingNode(new Map([
            ['foo', new TwingNodeExpressionConstant(null, 1, 1)],
            ['bar', new TwingNodeExpressionConstant('Foo', 1, 1)]
        ]), new Map(), 1, 1);
        let node = new TwingNodeMacro('foo', body, arguments_, 1, 1);
        let compiler = new TwingTestMockCompiler();

        test.same(compiler.compile(node).getSource(), `// line 1, column 1
macro_foo(__foo__ = null, __bar__ = \`Foo\`, ...__varargs__) {
    let context = this.env.mergeGlobals(new Map([
        [\`foo\`, __foo__],
        [\`bar\`, __bar__],
        [\`varargs\`, __varargs__]
    ]));

    let blocks = new Map();
    let result;
    let error;

    this.startOutputBuffering();
    try {
        this.echo(\`foo\`);

        let tmp = this.getOutputBufferContent();
        result = (tmp === '') ? '' : this.createMarkup(tmp, this.env.getCharset());
    }
    catch (e) {
        error = e;
    }

    this.endAndCleanOutputBuffer();

    if (error) {
        throw error;
    }
    return result;
}

`);

        test.end();
    });

    test.end();
});
