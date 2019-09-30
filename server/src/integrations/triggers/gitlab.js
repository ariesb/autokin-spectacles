/**
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 * 
 * 
 * Gitlab Triggers (config/triggers.config.json)
 * {
 *   "enabled": true,
 *   "plugin": "gitlab",
 *   "options": {
 *      "privateToken": "PRIVATE-TOKEN-FROM-GITLAB",
 *      "baseURL": "https://git.autokinjs.com"
 *   },
 *   "triggers": {
 *      "failed": {
 *          "method": "cancel",
 *          "jobName": "manual-job"
 *      },
 *      "passed": {
 *          "method": "play",
 *          "jobName": "manual-job"
 *      }
 *   }
 * }
 */
const request = require('request');

const getManualJobId = (opt, action, { pipelineProject, pipelineId }, callback) => {
    request({
        method: 'GET',
        uri: `${opt.baseURL}/api/v4/projects/${pipelineProject}/pipelines/${pipelineId}/jobs?scope=manual`,
        headers: {
            'PRIVATE-TOKEN': opt.privateToken
        }
    }, (error, response) => {
        let jobs = JSON.parse(response.body);
        if (response.statusCode == 200) {
            let targetJob = jobs.find(job => job.name == action.jobName);
            if(targetJob) {
                callback({
                    gitlabJobId: targetJob.id
                });
            }
        }
    });
};

const playJob = (opt, { pipelineProject }, gitlabJobId) => {
    request({
        method: 'POST',
        uri: `${opt.baseURL}/api/v4/projects/${pipelineProject}/jobs/${gitlabJobId}/play`,
        headers: {
            'PRIVATE-TOKEN': opt.privateToken
        }
    }, (error, response) => {
        if (response.statusCode == 200) {
            console.log(`${new Date().toISOString()} > Gitlab Trigger Plugin | Successfully trigger to execute pipeline job.`);
        }
    });
};

const cancelJob = (opt, { pipelineProject }, gitlabJobId) => {
    request({
        method: 'POST',
        uri: `${opt.baseURL}/api/v4/projects/${pipelineProject}/jobs/${gitlabJobId}/cancel`,
        headers: {
            'PRIVATE-TOKEN': opt.privateToken
        }
    }, (error, response) => {
        if (response.statusCode == 200) {
            console.log(`${new Date().toISOString()} > Gitlab Trigger Plugin | Successfully cancelled pipeline job.`);
        }
    });
};

const trigger = (action, configuration, job) => {
    getManualJobId(configuration.options, action, job, (data) => {
        console.log(`${new Date().toISOString()} > Gitlab Trigger Plugin | Performing pipeline ${action.method} trigger for ${job.pipelineProject}:${data.gitlabJobId}.`);
        if (action.method === 'play') {
            playJob(configuration.options, job, data.gitlabJobId);
        } else {
            cancelJob(configuration.options, job, data.gitlabJobId);
        }
    });
};

module.exports.trigger = trigger;
