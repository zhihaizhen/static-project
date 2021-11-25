const webpack = require("webpack");
const WebpackHtml = require("html-webpack-plugin");
const WebpackCopy = require("copy-webpack-plugin");

module.exports = {
    
    entry: {
        trading: "./static/pages/trading.js",
        staticIndex: "./static/pages/staticIndex.js",
        staticBt: "./static/pages/staticBt.js",
    },

    output: {
        path: __dirname + "/dist",
        filename: "static/pages/[name].js?[hash]"
    },

    module: {

        rules: [

            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },

            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },

    devServer: {
        
        host: "127.0.0.1",
        port: "9001",
    },

    plugins: [

        /**
         * html templates
         */

        new WebpackHtml({

            filename: "templates/trading.html",
            template: "./templates/trading.html",
            chunks: ["trading"],
            hash: true
        }),

        new WebpackHtml({

            filename: "templates/staticIndex.html",
            template: "./templates/staticIndex.html",
            chunks: ["staticIndex"],
            hash: true
        }),

        new WebpackHtml({

            filename: "templates/staticBt.html",
            template: "./templates/staticBt.html",
            chunks: ["staticBt"],
            hash: true
        }),

        new WebpackCopy([

            { from: "static/layui", to: "static/layui" },
            { from: "static/joyin", to: "static/joyin" },
            { from: "static/3rd/axios.min.js", to: "static/3rd/axios.min.js" },
            { from: "static/type-extension.js", to: "static/type-extension.js" },
            { from: "static/3rd/split.min.js", to: "static/3rd/split.min.js" },
        ])
    ],

    devtool: "cheap-module-source-map"
};