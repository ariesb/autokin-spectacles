/*
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const express = require('express');
const router = express.Router();

const GitLabStrategy = require('passport-gitlab2');

const create = ({passport, session}, config) => {
    passport.use(new GitLabStrategy(config,
        (accessToken, refreshToken, profile, cb) => {
            profile.accessToken = accessToken;
            return cb(false, profile);
        }
    ));

    router.get('/gitlab', passport.authenticate('gitlab'));
    router.get('/gitlab/callback',
        passport.authenticate('gitlab', {
            failureRedirect: '/login'
        }),
        (req, res) => {
            session.register(req.user);
            session[req.user.accessToken] = req.user;
            res.cookie('AutokinSession', req.user.accessToken, { path: '/', expire: new Date() + 1 });
            res.redirect(`/authorise/${req.user.accessToken}`);
        });

    router.get('/profile/:token', (req, res) => {
        const { token } = req.params;
        const profile = session[token];
        if (profile) {
            res.status(201).send(profile);
        } else {
            res.cookie('AutokinSession', '', { path: '/', expires: new Date(0) });
            res.status(401).send('Unauthorised.');
        }
    });

    router.get('/revoke/:token', (req, res) => {
        const { token } = req.params;
        delete session[token];
        res.clearCookie('AutokinSession', { path: '/', expires: new Date(0) });
        res.status(200).send('Revoked.');
    });  

    return router;
};


module.exports.create = create;