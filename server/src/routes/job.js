/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const express = require('express');
const job = require('../lib/job');
const project = require('../lib/project');
const { slack } = require('../integrations/slack');
const triggers = require('../integrations/triggers');

const router = express.Router();
const handle = (opt) => {
    router.get('/:pid/:fid/jobs/:jid', (req, res) => {
        const { pid, fid, jid } = req.params;
        const jobInfo = job.get({ pid, fid, jid }, opt.session);
        if (jobInfo == null) {
            res.status(404).send({
                ecode: 'JOB_NOT_FOUND'
            });
        } else {
            res.status(200).send(jobInfo);
        }
    });

    router.post('/:pid/:fid/jobs/:jid', (req, res) => {
        const { pid, fid, jid } = req.params;
        const { source, action, who } = req.body;

        const jobInfo = job.get({ pid, fid, jid }, opt.session);
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

        const feat = project.getFeature(fid);
        image.acted = {
            'by': who,
            'when': new Date().toISOString(),
            'as': action
        };

        // mapped user
        let user = opt.session.users[who];
        image.acted.user = user ? user : {};

        if (action == 'new base') {
            job.promoteNewBase(pid, fid, jid, source, who);
            feat.jobs[jid].result.new += 1;
        } else {
            feat.jobs[jid].result.failed += 1;
        }
        feat.jobs[jid].result.pending -= 1;
        project.saveFeature(fid, feat);

        jobInfo.screens = jobInfo.screens.map(screen => (screen.source == source ? image : screen));
        jobInfo.result = feat.jobs[jid].result;
        job.update({ pid, fid, jid, data: jobInfo });
        res.status(200).send(jobInfo);

        // notifications
        if (jobInfo.result.pending === 0) {
            slack({ pid, fid, jid, job: jobInfo, acted: true });

            // try to do triggers
            if (jobInfo.pipeline) {
                let status = jobInfo.result.failed > 0 ? 'failed' : 'passed';
                triggers.run(jobInfo.pipeline, status);
            }
        }
    });

    return router;
};

module.exports.handle = handle;