/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const request = require('request');

const session = {
    sessions: {},
    users: {},
    load: () => {
        const usersPath = path.resolve(process.cwd(), `./store/data/users.json`);
        if(fs.existsSync(usersPath)) {
            session.users = JSON.parse(fs.readFileSync(usersPath));
        }
    },
    register: (user) => {
        let isRegisteredUser = session.users[user.username];
        if (!isRegisteredUser) {
            let data = {
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                email: user.emails[0].value
            };
            session.users[user.username] = data;
            const usersPath = path.resolve(process.cwd(), `./store/data/users.json`);
            fs.writeFileSync(usersPath, JSON.stringify(session.users, null, 4));
        }
    }
};

const init = (app) => {
    session.load();
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
};

const support = (mode, config) => {
    const strategy = require(`./${mode}`);
    // sync users local copy
    strategy.syncUsers(session, config);
    return strategy.create({passport, session}, config);
};

module.exports.init = init;
module.exports.support = support;
module.exports.session = session;
