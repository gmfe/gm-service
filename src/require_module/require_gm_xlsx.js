function requireGmXlsx(callback) {
    require.ensure([], function(require) {
        const res = require('gm-xlsx');
        callback(res);
    });
}

export {
    requireGmXlsx
};

