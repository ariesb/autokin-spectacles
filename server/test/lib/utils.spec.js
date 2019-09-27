const assert = require('assert');
const utils = require('../../src/lib/utils');

describe('Autokin Spectacles: Library -> Utils', () => {

    it('should replace string using templates', () => {
        let data = utils.replace('Hello {autokin}!', {
            autokin: 'AutokinJS'
        });

        assert.strictEqual(data, 'Hello AutokinJS!');
    });

    it('should replace string using templates, unknown lookup should be return as is', () => {
        let data = utils.replace('Hello {autokin} {auto}!', {
            autokin: 'AutokinJS'
        });

        assert.strictEqual(data, 'Hello AutokinJS {auto}!');
    });

    it('should replace JSON object string values using templates', () => {
        let data = utils.json({
            'hi': 'Hello {autokin}!',
            'age': 0
        }, {
            autokin: 'AutokinJS',           
        });

        assert.deepEqual(data, {
            'hi': 'Hello AutokinJS!',
            'age': 0
        });
    });

    it('should replace JSON object string values using templates, with nested objects', () => {
        let data = utils.json({
            'hi': 'Hello {autokin}!',
            'props': {
                'name': '{autokin}, {autokin}'
            }
        }, {
            autokin: 'AutokinJS'
        });

        assert.deepEqual(data, {
            'hi': 'Hello AutokinJS!',
            'props': {
                'name': 'AutokinJS, AutokinJS'
            }
        });
    });

     
});