module.exports = {
    extends: ["eslint-config-reforis", "prettier"],
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": ["error"],
        "import/no-extraneous-dependencies": [
            "error",
            { peerDependencies: true },
        ],
    },
};
