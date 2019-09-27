/**
 * Copyright 2019 Autokin
 * Licensed under the MIT license. See LICENSE.
 * 
 * Simple string and JSON replacer using templates similar to handlebars
 */

const replace = (source, lookup) => {
    return source.replace(new RegExp('{([^{]+)}', 'g'), (match, name) => {
        return Object.prototype.hasOwnProperty.call(lookup, name) ? lookup[name] : `{${name}}`;
    });
};

const json = (template, lookup) => {
    let obj = Object.assign({}, template);
    for (var p in obj) {
        if (typeof (obj[p]) == 'object') {
            obj[p] = json(obj[p], lookup);
        } else if (typeof (obj[p]) == 'string') {
            obj[p] = replace(obj[p], lookup);
        }
    }
    return obj;
};

module.exports.replace = replace;
module.exports.json = json;