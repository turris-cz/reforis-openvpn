module.exports = {
    "extends": "eslint-config-reforis",
    "rules": {
        "import/no-extraneous-dependencies": ["error", { peerDependencies: true }],
    },
};
