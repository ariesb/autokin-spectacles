/**
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const path = require('path');
const fs = require('fs');

/** 
 * Triggers (config/triggers.config.json)
 * {
 *   "enabled": true,
 *   "plugin": "plugin-name"
 * }
 */
const config = () => {
    let config = null;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './config/triggers.config.json')));
    } catch (_error) {
        config = {
            enabled: false
        };
    }
    return config;
};

const requiresTrigger = (configuration, status) => {
    if (!configuration.enabled) return false;
    return configuration.triggers[status] !== null;
};

const run = (job, status) => {
    const configuration = config();
    if (!requiresTrigger(configuration, status)) return;

    let plugin = require(`./${configuration.plugin}`);
    let action = configuration.triggers[status];
    plugin.trigger(action, configuration, job);
};

module.exports.run = run;