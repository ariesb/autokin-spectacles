/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');

const sysenv = require('./lib/system');
const auth = require('./routes/auth');
const upload = require('./routes/upload');
const job = require('./routes/job');
const project = require('./routes/project');
const fs = require('fs');

let authConfig = null;
try {
    authConfig = JSON.parse(fs.readFileSync('./config/auth.config.json'));
} catch (_error) {
    console.log('Autokin Spectacles requires atleast one supported authentication.');
    process.exit(1);
}

sysenv.buildEnvironment();

const app = express();
const port = 8210;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({
    credentials: true
}));

auth.init(app);
app.get('/health', (req, res) => res.send({ status: 'active' }));
app.use('/auth', auth.support('gitlab', authConfig));
app.use('/api', upload.handle({ session: auth.session }));
app.use('/api', job.handle({ session: auth.session }));
app.use('/api', project.handle({ session: auth.session }));
app.use('/images', express.static('store/images'));
app.use(express.static(path.join(process.cwd(), '/docs')));
app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), '/docs/index.html'));
});

let instance = app.listen(port, () => {
    console.log(`Autokin Spectacles (${port})`);
    console.log(`Home: ${process.cwd()}`);
    console.log('----------------------------------------------------------------------------------');
});

module.exports.instance = instance;