const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const fs = require('fs');
const passport = require('passport');
const job = require('../src/lib/job');
const project = require('../src/lib/project');

chai.use(chaiHttp);
let server = null;
let existsSyncStub = null;
let readFileSyncStub = null;

describe('Autokin Spectacles: Server Started', () => {
    before(() => {
        sinon.stub(passport, 'authenticate')
            .callsFake((authType, options, next) => {
                return (req, res, next) => next();
            });

        existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
        readFileSyncStub = sinon.stub(fs, 'readFileSync')
            .callThrough()
            .withArgs(sinon.match('auth.config.json'))
            .returns(JSON.stringify({
                'clientID': 'client-id-autokin',
                'clientSecret': 'secret-key-autokin',
                'callbackURL': 'http://spectacles.autokinjs.com/auth/github/callback',
                'baseURL': 'https://git.autokinjs.com/'
            }));
        server = require('../src/server');
        fs.readFileSync.restore();
    });

    after(() => {
        existsSyncStub.restore();
        server.instance.close();
    });

    it('should be able to check health of server', (done) => {
        chai.request(server.instance)
            .get('/health')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should be able to handle unknown path', (done) => {
        chai.request(server.instance)
            .get('/unknown-path')
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });

    it('should be able to upload and return 400 if no files included', (done) => {
        chai.request(server.instance)
            .put('/api/upload')
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    });

    it('should be able to upload and returns 400 if job id already exists', (done) => {
        sinon.stub(job, 'exists').returns(true);
        chai.request(server.instance)
            .put('/api/upload')
            .type('form')
            .attach('snapshots', fs.readFileSync('./server/test/mockdata/test.zip'), 'test.zip')
            .end((err, res) => {
                expect(res).to.have.status(400);
                job.exists.restore();
                done();
            });
    });

    it('should be able to upload and success', (done) => {
        sinon.stub(job, 'exists').returns(false);
        sinon.stub(job, 'compare');
        sinon.stub(project, 'makeIfNotExists');
        chai.request(server.instance)
            .put('/api/upload')
            .type('form')
            .attach('snapshots', fs.readFileSync('./server/test/mockdata/test.zip'), 'test.zip')
            .end((err, res) => {
                expect(res).to.have.status(200);
                job.exists.restore();
                job.compare.restore();
                project.makeIfNotExists.restore();
                done();
            });
    });

    it('should be able to get all projects', (done) => {
        sinon.stub(project, 'getAll').returns('{}');
        chai.request(server.instance)
            .get('/api/projects')
            .end((err, res) => {
                expect(res).to.have.status(200);
                project.getAll.restore();
                done();
            });
    });

    it('should be able to get job', (done) => {
        sinon.stub(job, 'get').returns({});
        chai.request(server.instance)
            .get('/api/pid/jobs/jid')
            .end((err, res) => {
                expect(res).to.have.status(200);
                job.get.restore();
                done();
            });
    });

    it('should be return 404 if job not exists', (done) => {
        sinon.stub(job, 'get').returns(null);
        chai.request(server.instance)
            .get('/api/pid/jobs/jid')
            .end((err, res) => {
                expect(res).to.have.status(404);
                job.get.restore();
                done();
            });
    });

    it('should be return 400 invalid request if job not exists', (done) => {
        sinon.stub(job, 'get').returns(null);
        chai.request(server.instance)
            .post('/api/pid/jobs/jid')
            .send({
                source: 's',
                action: 'new base',
                who: 'autokin'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                job.get.restore();
                done();
            });
    });

    it('should be return 400 invalid request if screen does not exists', (done) => {
        sinon.stub(job, 'get').returns({});
        sinon.stub(job, 'hasScreen').returns(null);
        chai.request(server.instance)
            .post('/api/pid/jobs/jid')
            .send({
                source: 's',
                action: 'new base',
                who: 'autokin'
            })
            .end((err, res) => {
                expect(res).to.have.status(400);
                job.get.restore();
                job.hasScreen.restore();
                done();
            });
    });

    it('should be return 200 when marked as new base', (done) => {
        sinon.stub(job, 'get').returns({
            screens:[{
                source: 's'
            }, 
            {
                source: 'x'
            }] 
        });
        sinon.stub(job, 'hasScreen').returns({
            acted: null
        });
        sinon.stub(job, 'promoteNewBase');
        sinon.stub(job, 'update');
        sinon.stub(project, 'get').returns({
            jobs: { 
                'jid': {
                    result: {
                        new: 0,
                        pending: 1
                    }
                }
            }
        });
        sinon.stub(project, 'save');
        chai.request(server.instance)
            .post('/api/pid/jobs/jid')
            .send({
                source: 's',
                action: 'new base',
                who: 'autokin'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                job.get.restore();
                job.hasScreen.restore();
                job.update.restore();
                job.promoteNewBase.restore();
                project.get.restore();
                project.save.restore();
                done();
            });
    });

    it('should be return 200 when marked as failed', (done) => {
        sinon.stub(job, 'get').returns({
            screens: [{
                source: 's'
            },
            {
                source: 'x'
            }]
        });
        sinon.stub(job, 'hasScreen').returns({
            acted: null
        });
        sinon.stub(job, 'promoteNewBase');
        sinon.stub(job, 'update');
        sinon.stub(project, 'get').returns({
            jobs: {
                'jid': {
                    result: {
                        new: 0,
                        pending: 1
                    }
                }
            }
        });
        sinon.stub(project, 'save');
        chai.request(server.instance)
            .post('/api/pid/jobs/jid')
            .send({
                source: 's',
                action: 'failed',
                who: 'autokin'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                job.get.restore();
                job.hasScreen.restore();
                job.update.restore();
                job.promoteNewBase.restore();
                project.get.restore();
                project.save.restore();
                done();
            });
    });


    // gitlab auth
    it('should be to authenticate and redirect to client app', (done) => {
        chai.request(server.instance)
            .get('/auth/gitlab/callback')
            .query({ code: 'auth-gitlab-code' })
            .send({
                user: {
                    avatar: 'auth-avatar-profile'
                }
            })
            .end((err, res) => {
                expect(res).to.have.status(404); // redirection to app
                done();
            });
    });

    it('should be to retrieve profile on authentication', (done) => {
        chai.request(server.instance)
            .get('/auth/profile/auth-invalid-gitlab-code')
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            });
    });

    it('should be to invalidate token', (done) => {
        chai.request(server.instance)
            .get('/auth/revoke/auth-invalid-gitlab-code')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

});
