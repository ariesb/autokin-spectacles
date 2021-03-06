/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const express = require('express');
const project = require('../lib/project');

const router = express.Router();
const handle = (opt) => {
    router.get('/projects', (req, res) => {
        const projects = project.getAll(opt.session);
        res.status(200).send(projects);
    });

    return router;
};

module.exports.handle = handle;