import {asyncLoadJS} from '../async_load_js';

function requireBaiduApi(callback) {
    asyncLoadJS('baidumapApi', () => {
        require.ensure([], function (require) {
            const res = require('BMapLib');
            callback(res);
        });
    });
}

export default requireBaiduApi;

