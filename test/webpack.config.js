const WebpackTapeRun = require('webpack-tape-run')
const {join, resolve} = require('path');
const wrkPath = './test/webpack';

module.exports = {
    target: 'web',
    entry: [join(resolve(wrkPath), 'entry.js')],
    mode: 'production',
    node: {
        fs: 'empty'
    },
    output: {
        path: resolve(wrkPath),
        filename: 'output.js',
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['*', '.js']
    },
    plugins: [
        new WebpackTapeRun({
            reporter: 'tap-spec'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(html|twig)$/i,
                use: 'raw-loader',
            },
        ],
    },
    performance: {
        hints: false
    },
    stats: 'errors-only',
};