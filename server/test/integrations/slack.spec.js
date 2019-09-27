const assert = require('assert');
const { slack } = require('../../src/integrations/slack');
const fs = require('fs');
const sinon = require('sinon');
const nock = require('nock');

describe('Autokin Spectacles: Integrations -> Slack', () => {
    it('should not be able to send slack message when disabled', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
            enabled: false,
            token: 'XXX',
            channel: 'autokin-spectacles',
            baseURL: 'https://spectacles.autokinjs.com'
        }));

        slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                acted: null,
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',

                },
                result: {
                    failed: 0,
                    passed: 1,
                    new: 1,
                    pending: 0
                }
            }
        });

        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

    it('should not be able to send slack message when no config', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').throws();

        slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                acted: null,
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',

                },
                result: {
                    failed: 0,
                    passed: 1,
                    new: 1,
                    pending: 0
                }
            }
        });

        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

    it('should be able to send slack message in proper format: passed', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
            enabled: true,
            token: 'XXX',
            channel: 'autokin-spectacles',
            baseURL: 'https://spectacles.autokinjs.com'
        }));

        let expected = [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    text: ':tada: *Passed!* :clap: :heart_eyes: :100: \n\nVisual test for *`p` `f` `j`* was completed. There are *1 new*, *1 passed*, *0 failed*, and *0 pending* for action.\n\n:point_right: <https://spectacles.autokinjs.com/p/f/jobs/j|View your Autokin Spectacles successful test results>',
                },
                'accessory': {
                    'type': 'image',
                    'image_url': 'https://spectacles.autokinjs.com/slack.png',
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
                        'text': 'Test was triggered by Autokin, Fri, 27 Sep 2019 02:30:29 GMT.\n <https://www.autokinjs.com| :mountain: autokinjs.com>'
                    }
                ]
            }
        ];

        nock('https://slack.com')
            .post('/api/chat.postMessage')
            .reply(200, '{ "ok": true }');

        let messageBlock = slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                acted: null,
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',

                },
                result: {
                    failed: 0,
                    passed: 1,
                    new: 1,
                    pending: 0
                }
            }
        });

        assert.deepEqual(messageBlock, expected);
        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

    it('should be able to send slack message in proper format: failed', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
            enabled: true,
            token: 'XXX',
            channel: 'autokin-spectacles',
            baseURL: 'https://spectacles.autokinjs.com'
        }));

        let expected = [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': ':x: *Failed!* :thumbsdown: :sob: \n\nVisual test for *`p` `f` `j`* was completed. There are *1 new*, *1 passed*, *1 failed*, and *0 pending* for action.\n\n:point_right: <https://spectacles.autokinjs.com/p/f/jobs/j|Checkout the Autokin Spectacles results, and see what went wrong.>'
                },
                'accessory': {
                    'type': 'image',
                    'image_url': 'https://spectacles.autokinjs.com/slack.png',
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
                        'text': 'Test was triggered by Autokin, Fri, 27 Sep 2019 02:30:29 GMT.\n <https://www.autokinjs.com| :mountain: autokinjs.com>'
                    }
                ]
            }
        ];

        nock('https://slack.com')
            .post('/api/chat.postMessage')
            .reply(200, '{ "ok": true }');

        let messageBlock = slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                acted: null,
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',
                },
                result: {
                    failed: 1,
                    passed: 1,
                    new: 1,
                    pending: 0
                }
            }
        });

        assert.deepEqual(messageBlock, expected);
        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

    it('should be able to send slack message in proper format: pending', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
            enabled: true,
            token: 'XXX',
            channel: 'autokin-spectacles',
            baseURL: 'https://spectacles.autokinjs.com'
        }));

        let expected = [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': ':male-detective: *Pending for Actions!* :raised_hands: :face_with_monocle: \n\nVisual test for *`p` `f` `j`* was completed. There are *1 new*, *1 passed*, *0 failed*, and *1 pending* for action.\n\n:point_right: <https://spectacles.autokinjs.com/p/f/jobs/j|Review Autokin Spectacles test results, and take actions now!>'
                },
                'accessory': {
                    'type': 'image',
                    'image_url': 'https://spectacles.autokinjs.com/slack.png',
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
                        'text': 'Test was triggered by Autokin, Fri, 27 Sep 2019 02:30:29 GMT.\n <https://www.autokinjs.com| :mountain: autokinjs.com>'
                    }
                ]
            }
        ];

        nock('https://slack.com')
            .post('/api/chat.postMessage')
            .reply(200, '{ "ok": true }');

        let messageBlock = slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                acted: null,
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',
                },
                result: {
                    failed: 0,
                    passed: 1,
                    new: 1,
                    pending: 1
                }
            }
        });

        assert.deepEqual(messageBlock, expected);
        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

    it('should be able to send slack message in proper format: acted', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
            enabled: true,
            token: 'XXX',
            channel: 'autokin-spectacles',
            baseURL: 'https://spectacles.autokinjs.com'
        }));

        let expected = [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': ':x: *Failed!* :thumbsdown: :sob: \n\nVisual test for *`p` `f` `j`* was completed. There are *1 new*, *1 passed*, and *1 failed* screen tests.\n\n_There are 2 screen tests acted:_\n>:ng: *Autokin Test Screen 1*\n> :wavy_dash: _Marked Failed_ by *Autokin* on _Fri, 27 Sep 2019 02:30:29 GMT_.\n>:new: *Autokin Test Screen 2*\n> :wavy_dash: _Marked New_ by *Autokin* on _Fri, 27 Sep 2019 02:30:29 GMT_.\n\n:point_right: <https://spectacles.autokinjs.com/p/f/jobs/j|Checkout the Autokin Spectacles results, and see what went wrong.>',
                },
                'accessory': {
                    'type': 'image',
                    'image_url': 'https://spectacles.autokinjs.com/slack.png',
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
                        'text': 'Test was triggered by Autokin, Fri, 27 Sep 2019 02:30:29 GMT.\n <https://www.autokinjs.com| :mountain: autokinjs.com>'
                    }
                ]
            }
        ];

        nock('https://slack.com')
            .post('/api/chat.postMessage')
            .reply(200, '{ "ok": true }');

        let messageBlock = slack({
            pid: 'p', fid: 'f', jid: 'j', job: {
                when: '2019-09-27T02:30:29.745Z',
                user: {
                    displayName: 'Autokin',
                },
                screens: [{
                    acted: null
                }, {
                    acted: {
                        as: 'failed',
                        when: '2019-09-27T02:30:29.745Z',
                        user: {
                            displayName: 'Autokin'
                        }
                    },
                    source: 'autokin-test-screen-1.png'
                }, {
                    acted: {
                        as: 'new base',
                        when: '2019-09-27T02:30:29.745Z',
                        user: {
                            displayName: 'Autokin'
                        }
                    },
                    source: 'autokin-test-screen-2.png'
                }],
                result: {
                    failed: 1,
                    passed: 1,
                    new: 1,
                    pending: 0
                }
            },
            acted: true
        });

        assert.deepEqual(messageBlock, expected);
        assert(readFileSyncStub.called);
        fs.readFileSync.restore();
    });

});