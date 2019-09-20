const assert = require('assert');
const sinon = require('sinon');
const rewire = require('rewire');
const job = rewire('../../src/lib/job');
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;

describe('Autokin Spectacles: Library -> Job', () => {

    describe('hasScreen()', () => {
        let data = {
            'pid': 'test-project',
            'jid': '88dd6d34',
            'author': 'autokin',
            'ref': 'https://www.autokinjs.com/ref/88dd6d34',
            'when': '2019-08-15T14:02:48.628Z',
            'screens': [
                {
                    'acted': null,
                    'source': 'app-autokin.png',
                    'diff': {
                        'width': 1400,
                        'height': 800,
                        'diff': 0,
                        'percentage': 0
                    }
                }
            ]
        };

        it('should be able to find screen or image', () => {
            let screen = job.hasScreen(data, 'app-autokin.png');
            assert.deepEqual(screen, data.screens[0]);
        });

        it('should be able to return null when not found', () => {
            let screen = job.hasScreen(data, 'app-autokin-not.png');
            assert.deepEqual(screen, null);
        });
    });

    it('should be able to update job data', function () {
        let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
        let pid = 'test-project';
        let jid = '88dd6d34';
        job.update({ pid, jid, data: {} });

        const basePath = path.resolve(process.cwd(), `./store/images/${pid}/jobs/${jid}/results.json`);
        assert(writeFileSyncStub.calledWith(basePath));
        assert(writeFileSyncStub.calledWith(basePath, '{}'));
        writeFileSyncStub.restore();
    });

    it('should be able to check if job exists', function () {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
        let pid = 'test-project';
        let jid = '88dd6d34';
        let jobExists = job.exists({ pid, jid });

        assert(existsSyncStub.called);
        assert(jobExists);
        existsSyncStub.restore();
    });

    it('should be able to read existing job data', () => {
        let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('{}');
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);

        let pid = 'test-project';
        let jid = '88dd6d34';
        let data = job.get({ pid, jid });

        assert(existsSyncStub.called);
        assert(readFileSyncStub.called);
        assert.deepEqual(data, {});
        readFileSyncStub.restore();
        existsSyncStub.restore();
    });

    it('should be able to return null on attempt to read non existing job data', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);

        let pid = 'test-project';
        let jid = '88dd6d34';
        let data = job.get({ pid, jid });

        assert(existsSyncStub.called);
        assert.deepEqual(data, null);
        existsSyncStub.restore();
    });

    describe('promoteNewBase()', () => {
        it('should be able to copy new base image and unlink old base', () => {
            let unlinkSyncStub = sinon.stub(fs, 'unlinkSync');
            let copyFileSyncStub = sinon.stub(fs, 'copyFileSync');

            job.promoteNewBase('p', 'j', 's.png');

            assert(unlinkSyncStub.called);
            assert(copyFileSyncStub.called);
            copyFileSyncStub.restore();
            unlinkSyncStub.restore();
        });

        it('should be able to copy new base image and not unlink old base', () => {
            let unlinkSyncStub = sinon.stub(fs, 'unlinkSync');
            let copyFileSyncStub = sinon.stub(fs, 'copyFileSync');

            job.promoteNewBase('p', 'j', 's.png', false);

            assert(unlinkSyncStub.notCalled);
            assert(copyFileSyncStub.called);
            copyFileSyncStub.restore();
            unlinkSyncStub.restore();
        });
    });

    describe('compare()', () => {
        let jobData = {
            pid: 'test-project',
            jid: '88dd6d34',
            author: 'autokin',
            ref: 'ref://',
            source: {
                mv: (f, c) => { c(); }
            }
        };

        it('should be able to move files', () => {
            let mvStub = sinon.stub(jobData.source, 'mv');
            job.compare(jobData);
            assert(mvStub.called);
            mvStub.restore();
        });

        it('should be able to move files with error', () => {
            let expandSnapshotsOrig = job.__get__('expandSnapshots');
            let expandSnapshotsStub = sinon.stub();
            job.__set__('expandSnapshots', expandSnapshotsStub);
            let mvStub = sinon.stub(jobData.source, 'mv').callsFake((f, c) => {
                c({ error: 0 });
            });
            job.compare(jobData);

            assert(mvStub.called);
            assert(expandSnapshotsStub.notCalled);
            mvStub.restore();
            job.__set__('expandSnapshots', expandSnapshotsOrig);
        });

        it('should be able to move files and expand', () => {
            let expandSnapshotsOrig = job.__get__('expandSnapshots');
            let expandSnapshotsStub = sinon.stub();
            job.__set__('expandSnapshots', expandSnapshotsStub);
            let mvStub = sinon.stub(jobData.source, 'mv').callsFake((f, c) => {
                c();
            });
            job.compare(jobData);

            assert(mvStub.called);
            assert(expandSnapshotsStub.called);
            mvStub.restore();
            job.__set__('expandSnapshots', expandSnapshotsOrig);
        });

        it('should be able to move files, expand, and compare', () => {
            let expandSnapshotsOrig = job.__get__('expandSnapshots');
            let expandSnapshotsStub = sinon.stub().callsFake((d, c) => {
                c();
            });
            job.__set__('expandSnapshots', expandSnapshotsStub);

            let compareSnapshotsOrig = job.__get__('compareSnapshots');
            let compareSnapshotsStub = sinon.stub();
            job.__set__('compareSnapshots', compareSnapshotsStub);

            job.compare(jobData);

            assert(compareSnapshotsStub.called);
            job.__set__('expandSnapshots', expandSnapshotsOrig);
            job.__set__('compareSnapshots', compareSnapshotsOrig);
        });

        it('should be able to exapnd and create new folder and extract', () => {
            let extractOrig = job.__get__('extract');
            let extractStub = sinon.stub();
            job.__set__('extract', extractStub);

            let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
            job.__get__('expandSnapshots')({
                pid: 'test-project',
                jid: '88dd6d34',
                files: []
            }, null);

            assert(mkdirSyncStub.called);
            assert(extractStub.called);
            mkdirSyncStub.restore();
            job.__set__('extract', extractOrig);
        });

        it('should be able to compare images using pixelmatch', () => {
            const buildImageData = (data, r, g, b) => {
                let i = 0;
                while (i < data.length) {
                    data[i++] = r;
                    data[i++] = g;
                    data[i++] = b;
                    data[i++] = 0xFF;
                }

                return data;
            };

            const pid = 'test-project';
            const jid = '88dd6d34';
            const width = 100, height = 100;

            let imageRed = new PNG({
                width,
                height,
                colorType: 2,
                bgColor: {
                    red: 0,
                    green: 255,
                    blue: 0
                }
            });
            imageRed.data = buildImageData(imageRed.data, 255, 0, 0);

            let imageGreen = new PNG({
                width,
                height,
                colorType: 2,
                bgColor: {
                    red: 0,
                    green: 255,
                    blue: 0
                }
            });
            imageGreen.data = buildImageData(imageGreen.data, 0, 255, 0);


            let pngSyncReadStub = sinon.stub(PNG.sync, 'read')
                .onFirstCall().returns(imageRed)
                .onSecondCall().returns(imageGreen);
            let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
            let readFileSyncStub = sinon.stub(fs, 'readFileSync');
            let result = job.__get__('compareImage')(pid, jid, 'source', 'base');

            assert.deepEqual(result, {
                width,
                height,
                diff: width * height,
                percentage: 100
            });

            pngSyncReadStub.restore();
            writeFileSyncStub.restore();
            readFileSyncStub.restore();
        });

        it('should be able to compare snapshots', () => {
            let readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(['file1.json', 'file2.json', 'file3.json']);
            let existsSyncStub = sinon.stub(fs, 'existsSync')
                .onFirstCall().returns(true)      // simulate existing base image
                .onSecondCall().returns(false)    // simulate no base image
                .onThirdCall().returns(true);     // simulate existing base image

            let compareImageOrig = job.__get__('compareImage');
            let compareImageStub = sinon.stub()
                .onFirstCall().returns({diff: 100})   // simulate image with difference
                .onSecondCall().returns({ diff: 0 }); // simulate identical image
            job.__set__('compareImage', compareImageStub);

            let promoteNewBaseOrig = job.__get__('promoteNewBase');
            let promoteNewBaseStub = sinon.stub();
            job.__set__('promoteNewBase', promoteNewBaseStub);
            
            let writeFileSyncStub = sinon.stub(fs, 'writeFileSync');
            let readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify({
                jobs: {
                    '88dd6d34': {

                    }
                }
            }));

            job.__get__('compareSnapshots')({
                pid: 'test-project',
                jid: '88dd6d34',
                author: 'autokin',
                ref: 'http://autokin'
            });

            assert(readdirSyncStub.called);
            assert.strictEqual(promoteNewBaseStub.callCount, 1);
            assert.strictEqual(compareImageStub.callCount, 2);
            assert.strictEqual(writeFileSyncStub.callCount, 2);

            job.__set__('compareImage', compareImageOrig);
            job.__set__('promoteNewBase', promoteNewBaseOrig);
            readdirSyncStub.restore();
            existsSyncStub.restore();
            writeFileSyncStub.restore();
            readFileSyncStub.restore();
        });
    });

});