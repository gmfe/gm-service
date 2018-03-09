import {asyncLoadJS} from '../async_load_js';

function requirePdfmakeBold0(callback) {
    asyncLoadJS('pdfmakeBold0', () => {
        require.ensure([], function (require) {
            const res = require('pdfmakeBold0');
            callback(res);
        });
    });
}

export default requirePdfmakeBold0;

