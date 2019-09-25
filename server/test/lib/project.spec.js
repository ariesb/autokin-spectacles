const assert = require('assert');
const sinon = require('sinon');
const project = require('../../src/lib/project');
const fs = require('fs');

describe('Autokin Spectacles: Library -> Project', () => {

    it('should not try to create project artifacts if exists', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('{"features":[]}');
        let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

        project.makeIfNotExists('test-project', 'feature-id');

        assert(existsSyncStub.called);
        assert(readFileSyncStub.called);
        assert(writeFileSyncStub.called);
        assert(!mkdirSyncStub.called);
        fs.existsSync.restore();
        fs.mkdirSync.restore();
        fs.readFileSync.restore();
        fs.writeFileSync.restore();
    });

    it('should be able to create project artifacts if new', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

        let pid = 'test-project';
        project.makeIfNotExists(pid);

        assert(existsSyncStub.called);
        assert.strictEqual(mkdirSyncStub.callCount, 3);
        assert(writeFileSyncStub.called);
        fs.existsSync.restore();
        fs.mkdirSync.restore();
        fs.writeFileSync.restore();
    });

    it('should be able to write project data', () => {
        let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');

        let pid = 'test-project';
        project.save(pid, {});

        assert(writeFileSyncStub.called);
        fs.writeFileSync.restore();
    });

    it('should be able to read project data', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('{}');

        let pid = 'test-project';
        let data = project.get(pid);

        assert(readFileSyncStub.called);
        assert.deepEqual(data, {});
        readFileSyncStub.restore();
    });

    it('should be able to read all projects data', () => {
        let projectData = {
            'pid': 'test-project',
            'jobs': {
                '98dd6d34': {
                    'author': 'autokin',
                    'when': '2019-07-10T07:52:29.044Z',
                    'result': {
                        'passed': 1,
                        'failed': 0,
                        'new': 1
                    }
                },
                '88dd6d34': {
                    'author': 'autokin',
                    'when': '2019-08-10T10:29:47.059Z',
                    'result': {
                        'passed': 2,
                        'failed': 0,
                        'new': 0
                    }
                }
            }
        };

        let readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(['test-project.json']);
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify(projectData));

        let data = project.getAll({
            users: {}
        });
        
        assert.deepEqual(data[0].jobs.length, 2);
        assert.deepEqual(data[0].jobs[0].jid, '88dd6d34');
        assert(readdirSyncStub.called);
        assert.strictEqual(readFileSyncStub.callCount, 1);
        readdirSyncStub.restore();
        readFileSyncStub.restore();
    });

    it('should be able to read all projects data with user data', () => {
        let projectData = {
            'pid': 'test-project',
            'jobs': {
                '98dd6d34': {
                    'author': 'autokin',
                    'when': '2019-07-10T07:52:29.044Z',
                    'result': {
                        'passed': 1,
                        'failed': 0,
                        'new': 1
                    }
                },
                '88dd6d34': {
                    'author': 'autokin',
                    'when': '2019-08-10T10:29:47.059Z',
                    'result': {
                        'passed': 2,
                        'failed': 0,
                        'new': 0
                    }
                }
            }
        };

        let readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(['test-project.json']);
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify(projectData));
        let session = {
            users: {
                'autokin': {
                    'username': 'autokin',
                    'displayName': 'Autokin JS',
                    'avatarUrl': 'http://www.autokinjs.com/users/1/avatar.png',
                    'email': 'dev@autokinjs.com'
                }
            }
        };

        let data = project.getAll(session);

        assert.deepEqual(data[0].jobs.length, 2);
        assert.deepEqual(data[0].jobs[0].jid, '88dd6d34');
        assert(readdirSyncStub.called);
        assert.strictEqual(readFileSyncStub.callCount, 1);
        readdirSyncStub.restore();
        readFileSyncStub.restore();
    });

    describe('features', () => {
        it('should be able to write feature data', () => {
            let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
            project.saveFeature('feature-id', {});
            assert(writeFileSyncStub.called);
            fs.writeFileSync.restore();
        });

        it('should be able to read feature data', () => {
            let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('{}');
            let data = project.getFeature('feature-id');
            assert(readFileSyncStub.called);
            assert.deepEqual(data, {});
            readFileSyncStub.restore();
        });
    });
});