const assert = require('assert');
const sinon = require('sinon');
const syst = require('../../src/lib/system');
const fs = require('fs');

describe('Autokin Spectacles: Library -> System', () => {

    it('should not try to create folders when environment exists', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        syst.buildEnvironment();

        assert(existsSyncStub.called);
        assert(!mkdirSyncStub.called);
        existsSyncStub.restore();
        mkdirSyncStub.restore();
    });

    it('should be able to build environment when not exists', () => {
        let existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
        let mkdirSyncStub = sinon.stub(fs, 'mkdirSync');
        syst.buildEnvironment();

        assert(existsSyncStub.called);
        assert.strictEqual(mkdirSyncStub.callCount, 5);
        existsSyncStub.restore();
        mkdirSyncStub.restore();
    });
});