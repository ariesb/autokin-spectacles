/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const extract = require('extract-zip');

const expandSnapshots = ({ pid, jid, files }, cb) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}`);
    fs.mkdirSync(target);
    extract(files, { dir: target }, cb);
};

const newResult = ({ author, ref }) => {
    return {
        author,
        ref,
        when: new Date().toISOString(),
        result: {
            passed: 0,
            pending: 0,
            failed: 0,
            new: 0
        }
    };
};

const resolveBaseImage = (pid, baseName) => {
    const basePath = path.resolve(process.cwd(), `./store/images/${pid}/base/${baseName}`);
    if (fs.existsSync(basePath)) {
        return basePath;
    } else {
        return null;
    }
};

const compareImage = (pid, jid, source, base) => {
    const sourceImagePath = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/${source}`);
    const sourceImage = PNG.sync.read(fs.readFileSync(sourceImagePath));
    const baseImage = PNG.sync.read(fs.readFileSync(base));
    const { width, height } = sourceImage;
    const diff = new PNG({ width, height });

    let diffWeight = pixelmatch(sourceImage.data, baseImage.data, diff.data, width, height, { threshold: 0.1 });
    let diffPathName = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/${path.basename(source, '.png')}_diff.png`);
    fs.writeFileSync(diffPathName, PNG.sync.write(diff));

    return {
        width,
        height,
        diff: diffWeight,
        percentage: (diffWeight / (width * height)) * 100
    };
};

const promoteNewBase = (pid, jid, source, unlink = true) => {
    const oldBase = path.resolve(process.cwd(), `./store/images/${pid}/base/${source}`);
    if (unlink) fs.unlinkSync(oldBase);
    const newBase = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/${source}`);
    fs.copyFileSync(newBase, oldBase);
};

const compareSnapshots = ({ pid, jid, author, ref }) => {
    const source = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}`);
    let files = fs.readdirSync(source);
    let jobResult = newResult({ author, ref });
    let comparisons = { pid, jid, author, ref, when: jobResult.when, screens: [] };

    files.forEach(file => {
        let result = {
            acted: null,
            source: file,
            diff: 0
        };

        const basePath = resolveBaseImage(pid, file);
        if (basePath) {
            result.diff = compareImage(pid, jid, file, basePath);
            if (result.diff.diff > 0) {
                jobResult.result.pending += 1;
            } else {
                jobResult.result.passed += 1;
            }
        } else {
            result.diff = null;
            jobResult.result.new += 1;
            promoteNewBase(pid, jid, file, false);
        }

        comparisons.screens.push(result);
    });

    // save job results
    fs.writeFileSync(`${source}/results.json`, JSON.stringify(comparisons, null, 4));

    // update project results
    const projectMetaPath = path.resolve(process.cwd(), `./store/data/projects/${pid}.json`);
    let project = JSON.parse(fs.readFileSync(projectMetaPath));
    project.jobs[jid] = jobResult;
    fs.writeFileSync(projectMetaPath, JSON.stringify(project, null, 4));
};

const compare = ({ pid, jid, author, ref, source }) => {
    let files = path.resolve(process.cwd(), `./store/tmp/${source.name}`);
    source.mv(files, (err) => {
        if (!err) {
            expandSnapshots({ pid, jid, files }, () => {
                compareSnapshots({ pid, jid, author, ref });
            });
        }
    });
};

const exists = ({ pid, jid }) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}`);
    return fs.existsSync(target);
};

const get = ({ pid, jid }) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/results.json`);
    if (!fs.existsSync(target)) {
        return null;
    }

    let job = JSON.parse(fs.readFileSync(target));
    return job;
};

const hasScreen = (data, source) => {
    return data.screens.find(screen => screen.source == source);
};

const update = ({ pid, jid, data }) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/results.json`);
    fs.writeFileSync(target, JSON.stringify(data, null, 4));
};

module.exports.exists = exists;
module.exports.compare = compare;
module.exports.get = get;
module.exports.hasScreen = hasScreen;
module.exports.update = update;
module.exports.promoteNewBase = promoteNewBase;