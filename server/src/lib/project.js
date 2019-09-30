/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');
const triggers = require('../integrations/triggers');

const getAllProjectsAndFeatures = (session) => {
    const target = path.resolve(process.cwd(), './store/data/projects/');
    const projects = fs.readdirSync(target);
    let features = projects
        .filter(file => file.endsWith('.json'))
        .map(file => {
            let pid = path.basename(file, '.json');
            let project = this.get(pid);
            return project.features.map(fid => {
                let feature = this.getFeature(pid, fid);
                let sortedJobs = Object.entries(feature.jobs).sort((a, b) => new Date(b[1].when) - new Date(a[1].when));
                feature.jobs = sortedJobs.slice(0, 5).map(j => {
                    let [jid, job] = j;
                    job.jid = jid;
                    let user = session.users[job.author];
                    job.user = user ? user : {};
                    return job;
                });
                return feature;
            }, this);
        }, this);

    return features.flat();
};

const get = (pid) => {
    const projectTarget = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    let data = JSON.parse(fs.readFileSync(projectTarget));
    return data;
};

const save = (data) => {
    const projectTarget = path.resolve(process.cwd(), `./store/data/projects/${data.pid}.json`);
    fs.writeFileSync(projectTarget, JSON.stringify(data, null, 4));
};

const getFeature = (pid, fid) => {
    const featureTarget = path.resolve(process.cwd(), `./store/data/projects/${pid}/${fid}.json`);
    let data = JSON.parse(fs.readFileSync(featureTarget));
    return data;
};

const saveFeature = (data) => {
    const featureTarget = path.resolve(process.cwd(), `./store/data/projects/${data.pid}/${data.fid}.json`);
    fs.writeFileSync(featureTarget, JSON.stringify(data, null, 4));
};

const makeIfNotExists = (pid, fid) => {
    const projectPath = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    const projectFeatureRootPath = path.resolve(process.cwd(), `./store/data/projects/${pid}`);
    if (!fs.existsSync(projectPath)) {
        console.log(`${new Date().toISOString()} > New project, creating new structure for ${pid}.`);
        this.save({
            pid,
            features: [
            ]
        });

        fs.mkdirSync(projectFeatureRootPath, { recursive: true });
    }

    const featurePath = path.resolve(projectFeatureRootPath, `./${fid}.json`);
    if (!fs.existsSync(featurePath)) {
        console.log(`${new Date().toISOString()} > New feature for ${pid}, creating ${fid} feature structure.`);
        this.saveFeature({
            pid,
            fid,
            jobs: {}
        });

        let project = this.get(pid);
        project.features.push(fid);
        this.save(project);

        // create folder structure for images
        const imagesBasePath = path.resolve(process.cwd(), `./store/images/${pid}/${fid}`);
        fs.mkdirSync(imagesBasePath.concat('/base'), { recursive: true });
        fs.mkdirSync(imagesBasePath.concat('/history'), { recursive: true });
        fs.mkdirSync(imagesBasePath.concat('/jobs'), { recursive: true });
    }
};

const hasPendingAcrossFeatures = ({ pid, jid }) => {
    let project = this.get(pid);
    let features = [];
    if (project) {
        features = project.features.filter(fid => {
            let feature = this.getFeature(pid, fid);
            let job = feature.jobs[jid];
            return job && job.result.pending > 0;
        }, this);
    }

    return features.length > 0;
};

const runTriggers = (job) => {
    if (job.pipeline && !this.hasPendingAcrossFeatures(job)) {
        let status = job.result.failed > 0 ? 'failed' : 'passed';
        console.log(`${new Date().toISOString()} > Running pipeline trigger for ${job.pid} ${job.fid} ${job.jid} with ${status} status.`);
        triggers.run(job, status);
    } else {
        console.log(`${new Date().toISOString()} > Visual test ${job.pid} ${job.jid} has pending jobs, deferring pipeline trigger on completion.`);
    }
};

module.exports.makeIfNotExists = makeIfNotExists;
module.exports.getAll = getAllProjectsAndFeatures;
module.exports.get = get;
module.exports.save = save;
module.exports.getFeature = getFeature;
module.exports.saveFeature = saveFeature;
module.exports.hasPendingAcrossFeatures = hasPendingAcrossFeatures;
module.exports.runTriggers = runTriggers;