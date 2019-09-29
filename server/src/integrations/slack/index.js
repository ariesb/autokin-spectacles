/**
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 */
const { WebClient } = require('@slack/web-api');
const path = require('path');
const fs = require('fs');
const { json, replace } = require('../../lib/utils');

const statuses = {
    passed: {
        heading: ':tada: *Passed!* :clap: :heart_eyes: :100:',
        link_message: 'View your Autokin Spectacles successful test results'
    },
    failed: {
        heading: ':x: *Failed!* :thumbsdown: :sob:',
        link_message: 'Checkout the Autokin Spectacles results, and see what went wrong.'
    },
    pending: {
        heading: ':male-detective: *Pending for Actions!* :raised_hands: :face_with_monocle:',
        link_message: 'Review Autokin Spectacles test results, and take actions now!'
    }
};
const messages = {
    new_upload: '{status} \n\nVisual test for *`{projectid}` `{featureid}` `{jobid}`* was completed. There are *{new_stat} new*, *{passed_stat} passed*, *{failed_stat} failed*, and *{pending_stat} pending* for action.\n\n:point_right: <{base_url}/{projectid}/{featureid}/jobs/{jobid}|{link_message}>',
    acted: '{status} \n\nVisual test for *`{projectid}` `{featureid}` `{jobid}`* was completed. There are *{new_stat} new*, *{passed_stat} passed*, and *{failed_stat} failed* screen tests.\n\n_There are {acted_stat} screen tests acted:_\n{actions_list}\n\n:point_right: <{base_url}/{projectid}/{featureid}/jobs/{jobid}|{link_message}>',
    action_new: '>:new: *{acted_screen}*\n> :wavy_dash: _Marked New_ by *{acted_user}* on _{acted_when}_.',
    action_failed: '>:ng: *{acted_screen}*\n> :wavy_dash: _Marked Failed_ by *{acted_user}* on _{acted_when}_.',
};
const template = [
    {
        'type': 'section',
        'text': {
            'type': 'mrkdwn',
            'text': '{status_message}'
        },
        'accessory': {
            'type': 'image',
            'image_url': '{base_url}/slack.png',
            'alt_text': 'Autokin Spectacles'
        }
    },
    {
        'type': 'divider'
    },
    {
        'type': 'context',
        'elements': [
            {
                'type': 'mrkdwn',
                'text': 'Test was triggered by {author}, {when}.\n <https://www.autokinjs.com| :mountain: autokinjs.com>'
            }
        ]
    }
];

/** 
 * Slack Configuration Schema (config/slack.config.json)
 * {
 *   'enabled': true,
 *   'token': 'SLACK-TOKEN',
 *   'channel': 'TARGET-SLACK-CHANNEL',
 *   'baseURL': 'https://spectacles.autokinjs.com/'
 *}
 */
const config = () => {
    let config = null;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), './config/slack.config.json')));
    } catch (_error) {
        config = {
            enabled: false
        };
    }
    return config;
};

const slack = ({ pid: projectid, fid: featureid, jid: jobid, job, acted }) => {
    const configuration = config();    
    if(!configuration.enabled) return;

    let status = statuses[job.result.failed > 0 ? 'failed' : (job.result.pending > 0 ? 'pending' : 'passed')];
    let { passed: passed_stat, pending: pending_stat, failed: failed_stat, new: new_stat } = job.result;
    let lookup = {
        status: status.heading,
        link_message: status.link_message,
        projectid,
        featureid,
        jobid,
        passed_stat,
        pending_stat,
        failed_stat,
        new_stat,
        base_url: configuration.baseURL,
        author: job.user.displayName,
        when: new Date(job.when).toGMTString()
    };
    
    let status_message = '';
    if(acted) {
        let acted_stat = job.screens.reduce((total, screen) => total + (screen.acted ? 1 : 0), 0);
        lookup.acted_stat = acted_stat;

        let actions_list = job.screens
            .filter(screen => screen.acted !== null)
            .map(screen => {
                return replace((screen.acted.as === 'new base') ? messages.action_new : messages.action_failed, {
                    acted_user: screen.acted.user.displayName,
                    acted_when: new Date(screen.acted.when).toGMTString(),
                    acted_screen: screen.source.replace('.png', '').replace(/-/g, ' ').replace(/(?<=\s|^)([a-zA-Z"])/gm, (pattern) => pattern.toUpperCase())
                });
            }).join('\n');
        lookup.actions_list = actions_list;
        status_message = replace(messages.acted, lookup);
    } else {
        status_message = replace(messages.new_upload, lookup);
    }
    
    lookup.status_message = status_message;
    let blocks = json(template, lookup);
    const web = new WebClient(configuration.token);
    const slackMessage = {
        'text': 'Autokin Spectacles Visual Test Result',
        'blocks': blocks,
        'channel': configuration.channel,
        'link_names': true
    };
    web.chat.postMessage(slackMessage);

    return blocks;
};

module.exports.slack = slack;