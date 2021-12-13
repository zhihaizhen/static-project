const webpack = require("webpack");
const WebpackHtml = require("html-webpack-plugin");
const WebpackCopy = require("copy-webpack-plugin");
const pxtorem = require("postcss-pxtorem");
const Path = require('path');

module.exports = {
    
    entry: {
        // trading: "./static/pages/trading.js",
        // staticJs1: "./static/pages/staticJs1.js",
        // staticJs2: "./static/pages/staticJs2.js",
        // staticJs3: "./static/pages/staticJs3.js",
        // staticJs4: "./static/pages/staticJs4.js",
        staticJs5: "./static/pages/staticJs5.js",
        staticJs6: "./static/pages/staticJs6.js",
    },

    output: {
        path: Path.join(__dirname, "dist"),
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
                use: [
                {
                    loader: "style-loader"
                }, 
                
                {
                    loader: "css-loader"
                }, 
                // {
                //     loader: 'postcss-loader',
                //     options: {
                //       postcssOptions: {
                //         plugins: [
                //           [
                //             'postcss-preset-env',
                //             {
                //               // 其他选项
                //             },
                //           ],
                //         ],
                //       },
                //     },
                //   },
                {
                    loader: "sass-loader"
                },
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {
                        // name: path.join('static', 'images/[name].[ext]')
                        name: '[name].[ext]',
                        outputPath: '../static/images/'
                    }
                  }
                ]
            },

            // {
            //     test: /\.(png|jpg|gif)$/,
            //     use: [
            //       {
            //         loader: 'url-loader',
            //         options: {
            //             name: '[name].[ext]',
            //             outputPath: '../static/images/',
            //             limit: 400000
            //         }
            //       }
            //     ]
            // }
    
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

            filename: "index.html",
            template: "./templates/staticHtml6.html",
            chunks: ["staticJs6"],
            hash: true
        }),

        new WebpackCopy([

            { from: "static/images", to: "static/images" },
            { from: "static/bootstrap", to: "static/bootstrap" },
        ])
    ],

    devtool: "cheap-module-source-map"
};
