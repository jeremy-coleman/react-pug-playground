const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WriteFilePlugin = require("write-file-webpack-plugin");
const WebpackShellPlugin = require('./tasks/plugins/webpack-shell-plugin-next');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const ROOT = path.resolve(__dirname);
const bindRoot = path.join.bind(path, ROOT);

const containsFilter = (...values) => {
    return (filename) => {
        return values.some(value => {
            return filename.indexOf(value) >= 0;
        });
    }
};

const isNodeModuleFile = containsFilter("node_modules");

const endsWithFilter = (...extensions) => {
    return (filename) => {
        return extensions.some(ext => {
            return filename.endsWith(ext);
        });
    };
};

const defaultPublicPath = "/";

const createConfig = (env) => {
    const publicPath = env && env.publicPath ? env.publicPath : defaultPublicPath;
    const defaultAppEnv = {
        fabricFontBasePath: publicPath.endsWith("/") ? publicPath.substring(0, publicPath.length - 1) : publicPath,
        fabricIconBasePath: `${publicPath.endsWith("/") ? publicPath.substring(0, publicPath.length - 1) : publicPath}/icons/fabric/`
    };
    
    const appEnv = Object.assign({}, defaultAppEnv, env);
    const production = env && env.production ? true : false;
    const buildVersion = env && env.buildVersion ? env.buildVersion : production ? "Unknown" : "DEV";
    
    const AppConfig = {
        production: production,
        publicPath: publicPath,
        buildVersion: buildVersion,
        buildDate: new Date().toString(),
        env: appEnv
    };

    const config = {
        target: 'electron-renderer',

        mode: production ? "production" : "development",

        entry: {
            'corejs': 'core-js/client/shim',
            'zonejs': 'zone.js/dist/zone',
            'main': "./src/client/main.tsx"
        },

        output: {
            filename: production ? "[name].[chunkhash].js" : "[name].js",
            path: path.join(__dirname, "dist", "client"),
            publicPath: publicPath,
        },

        module: {
            rules: [
                {test: /\.less$/, loader: ExtractTextPlugin.extract({fallback: 'style-loader',use: ['css-loader',{loader: 'less-loader',options: {javascriptEnabled: true}}]})},
                {test: /\.scss$/,use: ["style-loader","css-loader","sass-loader"]},
                
                {test: /\.css$/,
                use: ExtractTextPlugin.extract({
                  loader: "css-loader",
                  options: { sourceMap: true }
                })
              },
              
              {test: endsWithFilter(".ts", ".tsx"),use: [{loader: 'babel-loader'}, {loader: 'ts-loader', options: {transpileOnly: true}}], exclude: isNodeModuleFile},
              {test: endsWithFilter(".js", ".jsx") ,use: [{loader: 'babel-loader'}], exclude: isNodeModuleFile},

                //{test: endsWithFilter(".jpg", ".png", ".gif"),use: [{ loader: "file-loader" }]},
                {
                    enforce: 'pre', // All images and fonts will be optimized and their paths will be solved
                    test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf|wav)(\?.*)?$/, use: [
                    {loader: 'url-loader',options: {name: 'assets/[name].[hash:10].[ext]',limit: 8192}},
                    {loader: 'img-loader'}
                ]}

            ]
        },
        resolve: {
            extensions: [".js", ".jsx", ".tsx", ".ts"],
            modules: [path.resolve(__dirname, "src/client"), "node_modules"],
            alias: {
                "package.json$": path.resolve(__dirname, "package.json"),
                'babel-core': bindRoot('node_modules/@babel/core')
            },
            mainFields: ['module', 'browser', 'main'],
        },

        devtool: "source-map",

        devServer: {
            contentBase: "./dist/client",
            historyApiFallback: true
        },

        plugins: [
            new HtmlWebpackPlugin({
                title: "Common Sample",
                template: "src/client/index.template.ts",
                AppConfig: AppConfig,
                chunksSortMode: (chunk1, chunk2) => {
                    let orders = ['corejs', 'zonejs', 'main'];
                    return orders.indexOf(chunk1.names[0]) - orders.indexOf(chunk2.names[0]);
                }
                //chunksSortMode: "none"
            }),

            new CopyWebpackPlugin([
                { from: "fonts/ms", to: "fonts" },
                { from: "node_modules/@uifabric/icons/fonts", to: "icons/fabric"},
                { from: "node_modules/@blueprintjs/core/lib/css/blueprint.css", to: "css/blueprint.css" },
                { from: "node_modules/@blueprintjs/datetime/lib/css/blueprint-datetime.css", to: "css/blueprint-datetime.css" },
                { from: "node_modules/@blueprintjs/table/lib/css/table.css", to: "css/blueprint-table.css" },
                { from: "node_modules/@blueprintjs/select/lib/css/blueprint-select.css", to: "css/blueprint-select.css" }
            ]),

            new ExtractTextPlugin('[name].css'),
            new WriteFilePlugin(),
            new WebpackShellPlugin({onBuildEnd: {scripts: ['npx electron . --dev']}})
        ]
    };
    
    return config;
};

module.exports = createConfig;

