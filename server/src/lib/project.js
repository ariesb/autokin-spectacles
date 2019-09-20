/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');

const makeIfNotExists = (pid) => {
    const basePath = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    if (!fs.existsSync(basePath)) {
        fs.writeFileSync(basePath, JSON.stringify({
            pid,
            jobs: {}
        }, null, 4));

        // create folder structure for images
        const imagesBasePath = path.resolve(process.cwd(), `./store/images/${pid}`);
        fs.mkdirSync(imagesBasePath.concat('/base'), { recursive: true });
        fs.mkdirSync(imagesBasePath.concat('/history'), { recursive: true });
        fs.mkdirSync(imagesBasePath.concat('/jobs'), { recursive: true });
    }
};

const getAll = () => {
    const target = path.resolve(process.cwd(), './store/data/projects/');
    const files = fs.readdirSync(target);
    const projects = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
            let project = JSON.parse(fs.readFileSync(path.resolve(target, file)));
            // filter only top 5; most recent
            let sortedJobs = Object.entries(project.jobs).sort((a, b) => new Date(b[1].when) - new Date(a[1].when));
            project.jobs = sortedJobs.slice(0, 5).map(job => {
                job[1].jid = job[0];
                return job[1];
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

const save = (pid, data) => {
    const projectTarget = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    fs.writeFileSync(projectTarget, JSON.stringify(data, null, 4));
};

module.exports.makeIfNotExists = makeIfNotExists;
module.exports.getAll = getAll;
module.exports.get = get;
module.exports.save = save;