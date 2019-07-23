/**
 * Loops over each item of a sequence.
 *
 * <pre>
 * <ul>
 *  {% for user in users %}
 *    <li>{{ user.username|e }}</li>
 *  {% endfor %}
 * </ul>
 * </pre>
 */
import {TwingTokenParser} from "../token-parser";
import {TwingNode} from "../node";
import {TwingToken} from "../token";
import {TwingNodeSpaceless} from "../node/spaceless";

export class TwingTokenParserSpaceless extends TwingTokenParser {
    parse(token: TwingToken): TwingNode {
        let stream = this.parser.getStream();
        let lineno = token.getLine();
        let columnno = token.getColumn();

        console.error(`The "spaceless" tag in "${stream.getSourceContext().getName()}" at line ${lineno} is deprecated since Twig 2.7, use the "spaceless" filter instead.`);

        stream.expect(TwingToken.BLOCK_END_TYPE);
        let body = this.parser.subparse([this, this.decideSpacelessEnd], true);
        stream.expect(TwingToken.BLOCK_END_TYPE);

        return new TwingNodeSpaceless(body, lineno, columnno, this.getTag());
    }

    decideSpacelessEnd(token: TwingToken) {
        return token.test(TwingToken.NAME_TYPE, 'endspaceless');
    }

    getTag() {
        return 'spaceless';
    }
}
