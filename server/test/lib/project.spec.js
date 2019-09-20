const assert = require('assert');
const sinon = require('sinon');
const project = require('../../src/lib/project');
const fs = require('fs');

describe('Autokin Spectacles: Library -> Project', () => {

    it('should not try to create project artifacts if exists', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        project.makeIfNotExists('test-project');

        assert(existsSyncStub.called);
        assert(!mkdirSyncStub.called);
        existsSyncStub.restore();
        mkdirSyncStub.restore();
    });

    it('should be able to create project artifacts if new', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        let writeFileSyncSpy = sinon.spy(fs, 'writeFileSync');

        let pid = 'test-project';
        project.makeIfNotExists(pid);

        assert(existsSyncStub.called);
        assert.strictEqual(mkdirSyncStub.callCount, 3);

        assert(writeFileSyncSpy.called);
        existsSyncStub.restore();
        mkdirSyncStub.restore();
        writeFileSyncSpy.restore();
    });

    it('should be able to write project data', () => {
        let writeFileSyncSpy = sinon.spy(fs, 'writeFileSync');

        let pid = 'test-project';
        project.save(pid, {});

        assert(writeFileSyncSpy.called);
        writeFileSyncSpy.restore();
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

        let data = project.getAll();
        
        assert.deepEqual(data[0].jobs.length, 2);
        assert.deepEqual(data[0].jobs[0].jid, '88dd6d34');
        assert(readdirSyncStub.called);
        assert.strictEqual(readFileSyncStub.callCount, 1);
        readdirSyncStub.restore();
        readFileSyncStub.restore();
    });
});