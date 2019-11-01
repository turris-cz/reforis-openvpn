/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

const path = require("path");

module.exports = () => ({
    mode: "development",
    entry: "./src/app.js",
    output: {
        filename: "app.min.js",
        path: path.join(__dirname, "../reforis_static/reforis_openvpn/"),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "./src"),
            path.resolve(__dirname, "./node_modules"),
        ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    // Equal to peerDependencies in package.json
    externals: {
        foris: "foris",
        "prop-types": "PropTypes",
        react: "React",
        "react-dom": "ReactDOM",
        "react-uid": "react-uid",
    },
});
