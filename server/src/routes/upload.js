/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 * 
 * CURL Upload Command
 * curl -X PUT --form "snapshots=@snapshots.zip" 
 *     -H "PROJECTID:mytestproject" 
 *     -H "FEATUREID:mytestfeature"
 *     -H "JOBID:bz8dd6d34"
 *     -H "AUTHOR:ariesbe"
 *     -H "REF:http://autokinjs.com/builds/bz8dd6d34" 
 *      https://spectacles.autokinjs.com/api/upload
 */
const express = require('express');
const job = require('../lib/job');
const project = require('../lib/project');

const router = express.Router();
const handle = () => {
    router.put('/upload', (req, res) => {
        if (!req.files) {
            return res.status(400).send('No files were uploaded.');
        }

        let { projectid: pid, featureid: fid, jobid: jid, author, ref } = req.headers;
        if (job.exists({ pid, fid, jid })) {
            return res.status(400).send('Job already exists.');
        }

        project.makeIfNotExists(pid, fid);
        let source = req.files.snapshots;
        job.compare({
            pid,
            fid,
            jid,
            author,
            ref,
            source
        });
        res.send('File uploaded!');
    });

    return router;
};

module.exports.handle = handle;