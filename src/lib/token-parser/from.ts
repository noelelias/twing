import {TwingTokenParser} from "../token-parser";
import {TwingToken} from "../token";

import {TwingNodeImport} from "../node/import";
import {TwingNodeExpressionAssignName} from "../node/expression/assign-name";

/**
 * Imports macros.
 *
 * <pre>
 *   {% from 'forms.html' import forms %}
 * </pre>
 */
export class TwingTokenParserFrom extends TwingTokenParser {
    parse(token: TwingToken) {
        let macro = this.parser.getExpressionParser().parseExpression();
        let stream = this.parser.getStream();

        stream.expect(TwingToken.NAME_TYPE, 'import');

        let targets = new Map();

        do {
            let name = stream.expect(TwingToken.NAME_TYPE).getValue();
            let alias = name;

            if (stream.nextIf(TwingToken.NAME_TYPE, 'as')) {
                alias = stream.expect(TwingToken.NAME_TYPE).getValue();
            }

            targets.set(name, alias);

            if (!stream.nextIf(TwingToken.PUNCTUATION_TYPE, ',')) {
                break;
            }
        } while (true);

        stream.expect(TwingToken.BLOCK_END_TYPE);

        let expr = new TwingNodeExpressionAssignName(this.parser.getVarName(), token.getLine(), token.getColumn());
        let node = new TwingNodeImport(macro, expr, token.getLine(), token.getColumn(), this.getTag());

        for (let [name, alias] of targets) {
            this.parser.addImportedSymbol('function', alias, `macro_${name}`, expr);
        }

        return node;
    }

    getTag() {
        return 'from';
    }
}
