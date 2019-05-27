class Buffer {
    private _level: number;
    private _contents: Promise<string>[];

    constructor(level: number = 0) {
        this._level = level;
        this._contents = [];
    }

    get level(): number {
        return this._level;
    }

    append(content: Promise<string>) {
        this._contents.push(content);
    }

    write(content: Promise<string>) {
        this._contents = [content];
    }

    getContent() {
        return Promise.all(this._contents)
            .then((content) => {
                return content.join('');
            });
    }
}

export class TwingOutputBuffer {
    private buffers: Buffer[];

    constructor() {
        this.buffers = [];
    }

    start(): Buffer {
        let buffer = new Buffer(this.getNestingLevel());

        this.buffers.push(buffer);

        return buffer;
    }

    echo(value: any) {
        console.warn('ECHO', typeof value === 'string');

        return this.write(value);
    }

    /**
     * Return the nesting level of the output buffering mechanism.
     *
     * @return {number}
     */
    getNestingLevel(): number {
        return this.buffers.length;
    }

    /**
     * Return the contents of the output buffer.
     *
     * @returns {Promise<string | false>}
     */
    getContent(): Promise<string | false> {
        let active = this.getActive();

        return active ? active.getContent() : Promise.resolve(false);
    }

    /**
     * Empty the top-most buffer.
     *
     * ┌─────────┐    ┌─────────┐
     * │   oof   │    │         │
     * ├─────────┤    ├─────────┤
     * │   bar   │ => │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     */
    clean() {
        let active = this.getActive();

        if (!active) {
            return false;
        }

        active.write(Promise.resolve(''));

        return true;
    }

    /**
     * Remove the top-most buffer.
     *
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     * @returns {boolean}
     */
    end(): boolean {
        if (this.clean()) {
            this.buffers.pop();

            return true;
        }

        return false;
    }

    /**
     * Remove the top-most buffer and return its content.
     *
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │   bar   │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => oof
     * └─────────┘    └─────────┘
     *
     * @returns {string | false}
     */
    endAndGet(): Promise<string | false> {
        let content = this.getContent();

        this.end();

        return content;
    }

    /**
     * Append the top-most buffer to the second-top-most buffer and empty the top-most buffer.
     *
     * ┌─────────┐    ┌─────────┐
     * │   oof   │    │         │
     * ├─────────┤    ├─────────┤
     * │   bar   │ => │  baroof │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     */
    flush() {
        let active = this.getActive();

        if (!active) {
            return false;
        }

        this.buffers.pop();
        this.write(active.getContent());

        active.write(Promise.resolve(''));

        this.buffers.push(active);

        return true;
    }

    /**
     * Append the top-most buffer to the second-top-most buffer and remove the top-most buffer.
     *
     * ┌─────────┐
     * │   oof   │
     * ├─────────┤    ┌─────────┐
     * │   bar   │ -> │  baroof │
     * ├─────────┤    ├─────────┤
     * │   foo   │    │   foo   │ => true
     * └─────────┘    └─────────┘
     *
     * @returns {boolean}
     */
    flushAndEnd(): boolean {
        if (!this.getActive()) {
            return false;
        }

        this.flush();
        this.buffers.pop();

        return true;
    }

    /**
     * Append the content to the top-most buffer or output the content if there is none.
     *
     * @param {Promise<string>} content
     *
     * @return void
     */
    private write(content: Promise<string>): string | void {
        let active = this.getActive();

        if (active) {
            active.append(content);
        } else {
            content
                .then((buffer) => {
                    if (process && process.stdout) {

                        process.stdout.write(buffer);
                    } else {
                        console.log(buffer);
                    }
                });
        }
    }

    /**
     * Return the top-most buffer.
     *
     * @return Buffer
     */
    private getActive(): Buffer {
        if (this.buffers.length > 0) {
            return this.buffers[this.buffers.length - 1];
        } else {
            return null;
        }
    }
}
