import {asyncLoadJS} from '../async_load_js';

function requireEcharts(callback) {
    asyncLoadJS('echarts', () => {
        require.ensure([], function (require) {
            const res = require('echarts');
            callback(res);
        });
    });
}

export default requireEcharts;

