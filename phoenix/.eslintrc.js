module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "no-mixed-operators": [
            "off", {"allowSamePrecedence": false},
        ],
        "max-len": "off",
    },
    "globals": {
        "Window": true,
        "Key": true,
        "Space": true
    }
};