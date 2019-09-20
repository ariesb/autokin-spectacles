const proxy = require('http-proxy-middleware');

module.exports = function (app) {
    app.use('/api', proxy({
        target: 'http://localhost:8210',
        changeOrigin: false,
    }));

    app.use('/auth', proxy({
        target: 'http://localhost:8210',
        changeOrigin: false,
    }));
};