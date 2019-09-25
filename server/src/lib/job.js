/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const extract = require('extract-zip');
const project = require('./project');

const expandSnapshots = ({ pid, fid, jid, files }, cb) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}`);
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

const resolveBaseImage = (pid, fid, baseName) => {
    const basePath = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/base/${baseName}`);
    if (fs.existsSync(basePath)) {
        return basePath;
    } else {
        return null;
    }
};

const compareImage = (pid, fid, jid, source, base) => {
    const sourceImagePath = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}/${source}`);
    const sourceImage = PNG.sync.read(fs.readFileSync(sourceImagePath));
    const baseImage = PNG.sync.read(fs.readFileSync(base));
    const { width, height } = sourceImage;
    const { width: bwidth, height: bheight } = baseImage;

    if((width === bwidth) && (height === bheight)) {
        const diff = new PNG({ width, height });
        let diffWeight = pixelmatch(sourceImage.data, baseImage.data, diff.data, width, height, { threshold: 0.1 });
        let diffPathName = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}/${path.basename(source, '.png')}_diff.png`);
        fs.writeFileSync(diffPathName, PNG.sync.write(diff));

        return {
            width,
            height,
            diff: diffWeight,
            percentage: (diffWeight / (width * height)) * 100
        };
    } else {
        return {
            size: true,
            width,
            height,
            diff: width * height,
            percentage: 1.0
        };
    }
};

const newBaseData = (author, jid) => {
    return {
        'by': author,
        'when': new Date().toISOString(),
        'from': jid,
        'previous': null,
        'history': {}
    };
};

const promoteNewBase = (pid, fid, jid, source, author, withbase = true) => {
    const historyBase = path.resolve(process.cwd(), `./store/history/${pid}/${fid}/base/`);
    if (!fs.existsSync(historyBase)) {
        fs.mkdirSync(historyBase, { recursive: true });
    }

    const oldBase = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/base/${source}`);
    const historyBaseFile = path.resolve(process.cwd(), `./store/history/${pid}/${fid}/base/${jid}-${source}`);
    if(withbase) fs.renameSync(oldBase, historyBaseFile);

    const newBase = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}/${source}`);
    fs.copyFileSync(newBase, oldBase);

    // save to base.json
    const baseMeta = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/base/base.json`);
    let data = {};
    if (!fs.existsSync(baseMeta)) {
        data[source] = newBaseData(author, jid);
    } else {
        data = JSON.parse(fs.readFileSync(baseMeta));
        let baseData = data[source];
        if(!baseData) {
            baseData = newBaseData(author, jid);
        } else {
            let historyPod = {
                'by': baseData.by,
                'when': baseData.when,
                'replace': jid
            };

            baseData.previous =  baseData.from;
            baseData.by = author;
            baseData.when = new Date().toISOString();
            baseData.history[baseData.previous] = historyPod;
            baseData.from = jid;
            data[source] = baseData;
        } 
    }
    fs.writeFileSync(baseMeta, JSON.stringify(data, null, 4));
};

const compareSnapshots = ({ pid, fid, jid, author, ref }) => {
    const source = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}`);
    let files = fs.readdirSync(source);
    let jobResult = newResult({ author, ref });
    let comparisons = { pid, fid, jid, author, ref, when: jobResult.when, screens: [] };

    files.forEach(file => {
        let result = {
            acted: null,
            source: file,
            diff: 0
        };

        const basePath = resolveBaseImage(pid, fid, file);
        if (basePath) {
            result.diff = compareImage(pid, fid, jid, file, basePath);
            if (result.diff.diff > 0) {
                jobResult.result.pending += 1;
            } else {
                jobResult.result.passed += 1;
            }
        } else {
            result.diff = null;
            jobResult.result.new += 1;
            promoteNewBase(pid, fid, jid, file, author, false);
        }

        comparisons.screens.push(result);
    });

    // save job results
    comparisons.result = jobResult.result;
    fs.writeFileSync(`${source}/results.json`, JSON.stringify(comparisons, null, 4));

    // update features results
    let feature = project.getFeature(fid);
    feature.jobs[jid] = jobResult;
    project.saveFeature(fid, feature);
};

const compare = ({ pid, fid, jid, author, ref, source }) => {
    let files = path.resolve(process.cwd(), `./store/tmp/${source.name}`);
    source.mv(files, (err) => {
        if (!err) {
            expandSnapshots({ pid, fid, jid, files }, () => {
                compareSnapshots({ pid, fid, jid, author, ref });
            });
        }
    });
};

const exists = ({ pid, fid, jid }) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}`);
    return fs.existsSync(target);
};

const get = ({ pid, fid, jid }, session) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}/results.json`);
    if (!fs.existsSync(target)) {
        return null;
    }

    let job = JSON.parse(fs.readFileSync(target));
    // get author details
    let authorDetails = session.users[job.author];
    job.user = authorDetails ? authorDetails : {};

    // get users acted
    job.screens = job.screens.map(screen => {
        if(screen.acted) {
            let user = session.users[screen.acted.by];
            screen.acted.user = user ? user : {};
        }
        return screen;
    });

    return job;
};

const hasScreen = (data, source) => {
    return data.screens.find(screen => screen.source == source);
};

const update = ({ pid, fid, jid, data }) => {
    const target = path.resolve(process.cwd(), `./store/images/${pid}/${fid}/jobs/${jid}/results.json`);
    fs.writeFileSync(target, JSON.stringify(data, null, 4));
};

module.exports.exists = exists;
module.exports.compare = compare;
module.exports.get = get;
module.exports.hasScreen = hasScreen;
module.exports.update = update;
module.exports.promoteNewBase = promoteNewBase;