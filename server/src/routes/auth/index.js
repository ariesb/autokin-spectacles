/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const passport = require('passport');

const session = {};

const init = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
};

const support = (mode, config) => {
    const strategy = require(`./${mode}`);
    return strategy.create({passport, session}, config);
};

module.exports.init = init;
module.exports.support = support;
