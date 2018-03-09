import {asyncLoadJS} from '../async_load_js';

function requireEcharts(callback) {
    asyncLoadJS('baidumapApi', () => {
        require.ensure([], function (require) {
            const res = require('baidumapApi');
            callback(res);
        });
    });
}

export default requireEcharts;

