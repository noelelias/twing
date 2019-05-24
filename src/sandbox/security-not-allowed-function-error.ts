import {TwingSandboxSecurityError} from "./security-error";

export class TwingSandboxSecurityNotAllowedFunctionError extends TwingSandboxSecurityError {
    private functionName: string;

    constructor(message: string, functionName: string, lineno: number, filename: string = null) {
        super(message, lineno, filename);

        this.name = 'TwingSandboxSecurityNotAllowedFunctionError';
        this.functionName = functionName;
    }

    getFunctionName() {
        return this.functionName;
    }
}
