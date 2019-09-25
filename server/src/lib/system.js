/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');

const buildEnvironment = () => {
    let target = path.resolve(process.cwd(), './store/data');
    if (!fs.existsSync(target)) {
        target = path.resolve(process.cwd(), './store');
        fs.mkdirSync(target.concat('/data/projects'), { recursive: true });
        fs.mkdirSync(target.concat('/data/features'), { recursive: true });
        fs.mkdirSync(target.concat('/history'), { recursive: true });
        fs.mkdirSync(target.concat('/images'), { recursive: true });
        fs.mkdirSync(target.concat('/tmp'), { recursive: true });
    }
};

module.exports.buildEnvironment = buildEnvironment;
