import {asyncLoadJS} from '../async_load_js';

function requireBaidumapLushu(callback) {
    asyncLoadJS('baidumapLushu', () => {
        require.ensure([], function (require) {
            const res = require('baidumapLushu');
            callback(res);
        });
    });
}

export default requireBaidumapLushu;

