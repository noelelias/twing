import {TwingTokenParser} from "../token-parser";
import {TwingNode} from "../node";
import {TwingToken} from "../token";
import {TwingNodeExpressionBlockReference} from "../node/expression/block-reference";
import {TwingNodeExpressionConstant} from "../node/expression/constant";
import {TwingNodeBlock} from "../node/block";
import {TwingNodePrint} from "../node/print";

/**
 * Filters a section of a template by applying filters.
 *
 * <pre>
 * {% filter upper %}
 *  This text becomes uppercase
 * {% endfilter %}
 * </pre>
 */
export class TwingTokenParserFilter extends TwingTokenParser {
    parse(token: TwingToken): TwingNode {
        let stream = this.parser.getStream();
        let lineno = token.getLine();
        let columno = token.getColumn();

        console.error(`The "filter" tag in "${stream.getSourceContext().getName()}" at line ${lineno} is deprecated since Twig 2.9, use the "apply" tag instead.`);

        let name = this.parser.getVarName();
        let ref = new TwingNodeExpressionBlockReference(new TwingNodeExpressionConstant(name, lineno, columno), null, lineno, columno, this.getTag());
        let filter = this.parser.getExpressionParser().parseFilterExpressionRaw(ref, this.getTag());

        this.parser.getStream().expect(TwingToken.BLOCK_END_TYPE);

        let body = this.parser.subparse([this, this.decideBlockEnd], true);

        this.parser.getStream().expect(TwingToken.BLOCK_END_TYPE);

        let block = new TwingNodeBlock(name, body, lineno, columno);

        this.parser.setBlock(name, block);

        return new TwingNodePrint(filter, lineno, columno, this.getTag());
    }

    decideBlockEnd(token: TwingToken) {
        return token.test(TwingToken.NAME_TYPE, 'endfilter');
    }

    getTag() {
        return 'filter';
    }
}
