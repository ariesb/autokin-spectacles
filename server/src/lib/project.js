/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');

const getAll = (session) => {
    const target = path.resolve(process.cwd(), './store/data/features/');
    const files = fs.readdirSync(target);
    const projects = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            let project = JSON.parse(fs.readFileSync(path.resolve(target, file)));
            // filter only top 5; most recent
            let sortedJobs = Object.entries(project.jobs).sort((a, b) => new Date(b[1].when) - new Date(a[1].when));
            project.jobs = sortedJobs.slice(0, 5).map(j => {
                let [jid, job] = j;
                job.jid = jid;
                let user = session.users[job.author];
                job.user = user ? user : {};
                return job;
            });
            return project;
        });

    return projects;
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

const getFeature = (fid) => {
    const featureTarget = path.resolve(process.cwd(), `./store/data/features/${fid}.json`);
    let data = JSON.parse(fs.readFileSync(featureTarget));
    return data;
};

const saveFeature = (data) => {
    const featureTarget = path.resolve(process.cwd(), `./store/data/features/${data.fid}.json`);
    fs.writeFileSync(featureTarget, JSON.stringify(data, null, 4));
};

const makeIfNotExists = (pid, fid) => {
    const projectPath = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    if (!fs.existsSync(projectPath)) {
        this.save({
            pid,
            features: [
                fid
            ]
        });
    }

    const featurePath = path.resolve(process.cwd(), `./store/data/features/${fid}.json`);
    if (!fs.existsSync(featurePath)) {
        this.saveFeature({
            pid,
            fid,
            jobs: {}
        });

        let project = this.get(pid);
        console.log(project.features);
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
            let feature = this.getFeature(fid);
            let job = feature.jobs[jid];
            return job && job.result.pending > 0;
        }, this);
    }

    return features.length > 0;
};

module.exports.makeIfNotExists = makeIfNotExists;
module.exports.getAll = getAll;
module.exports.get = get;
module.exports.save = save;
module.exports.getFeature = getFeature;
module.exports.saveFeature = saveFeature;
module.exports.hasPendingAcrossFeatures = hasPendingAcrossFeatures;