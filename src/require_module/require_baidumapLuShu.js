import {asyncLoadJS} from '../async_load_js';

function requireEcharts(callback) {
    asyncLoadJS('baidumapLushu', () => {
        require.ensure([], function (require) {
            const res = require('baidumapLushu');
            callback(res);
        });
    });
}

export default requireEcharts;

