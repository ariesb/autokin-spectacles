/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const express = require('express');
const job = require('../lib/job');
const project = require('../lib/project');

const router = express.Router();
const handle = () => {
    router.get('/:pid/jobs/:jid', (req, res) => {
        const { pid, jid } = req.params;
        const jobInfo = job.get({ pid, jid });
        if (jobInfo == null) {
            res.status(404).send({
                ecode: 'JOB_NOT_FOUND'
            });
        } else {
            res.status(200).send(jobInfo);
        }
    });

    router.post('/:pid/jobs/:jid', (req, res) => {
        const { pid, jid } = req.params;
        const { source, action, who } = req.body;

        const jobInfo = job.get({ pid, jid });
        if (!jobInfo) {
            res.status(400).send({
                ecode: 'INVALID_REQUEST'
            });
            return;
        }

        let image = job.hasScreen(jobInfo, source);
        if (!image) {
            res.status(400).send({
                ecode: 'INVALID_REQUEST'
            });
            return;
        }

        const proj = project.get(pid);
        image.acted = {
            'by': who,
            'when': new Date().toISOString(),
            'as': action
        };

        if (action == 'new base') {
            job.promoteNewBase(pid, jid, source);
            proj.jobs[jid].result.new += 1;
        } else {
            proj.jobs[jid].result.failed += 1;
        }
        proj.jobs[jid].result.pending -= 1;
        project.save(pid, proj);

        jobInfo.screens = jobInfo.screens.map(screen => (screen.source == source ? image : screen));
        job.update({ pid, jid, data: jobInfo });
        res.status(200).send(jobInfo);
    });

    return router;
};

module.exports.handle = handle;