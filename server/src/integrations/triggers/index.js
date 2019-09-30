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

const requiresTrigger = (configuration, pid, status) => {
    if (!configuration.enabled) return false;
    return getTrigger(configuration, pid, status) !== null;
};

const getTrigger = (configuration, pid, status) => {
    let projectTriggers = configuration.triggers[pid];
    if(projectTriggers) {
        return projectTriggers[status];
    }

    return null;
};

const run = (job, status) => {
    const configuration = config();
    if (!requiresTrigger(configuration, job.pid, status)) return;

    let plugin = require(`./${configuration.plugin}`);
    let action = getTrigger(configuration, job.pid, status);
    plugin.trigger(action, configuration, job.pipeline);
};

module.exports.run = run;