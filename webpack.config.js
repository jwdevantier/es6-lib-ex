const libname = 'godo';

const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

const outputFile = libname + '.js';

const PROJECT_ROOT = __dirname;
// Corresponds to npm script run (e.g. 'npm run <cmd-here>')
const CMD = process.env.npm_lifecycle_event || 'dev';
// Map scripts to a build profile, 'npm run build' => build, all others
// default to 'dev' for now.
const BUILD_PROFILE = (function (cmd) {
    switch (cmd) {
        case 'build': return 'build';
        default: return 'dev';
    }
})(CMD);

console.log("Build Profile: '" + BUILD_PROFILE + "'");

const common = {
    entry: path.resolve(PROJECT_ROOT, 'src'),
    devtool: 'source-map',
    output: {
        path: path.resolve(PROJECT_ROOT, 'lib'),
        filename: outputFile,
        library: libname,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/
            },
            /*{
                test: /(\.jsx|\.js)$/,
                loader: "eslint-loader",
                exclude: /node_modules/
            }*/
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            // Allow using npm link or similar in 'deps' folder to supply
            // vendor-deps (outside of npm registry)
            path.resolve(PROJECT_ROOT, 'deps'),
            path.resolve(PROJECT_ROOT, 'node_modules')
        ],
        alias: {
            "@": path.resolve(__dirname)
        }
    }
};

if (BUILD_PROFILE === 'dev') {
    module.exports = merge(common, {
        output: {
            filename: libname + '.js'
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: false,
                debug: true
            }),
            //do not emit erroneous assets
            new webpack.NoEmitOnErrorsPlugin(),
        ]
    })
} else if (BUILD_PROFILE === 'build') {
    module.exports = merge(common, {
        output: {
            filename: libname + '.min.js'
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                },
                sourceMap: false
            })
        ]
    })
}