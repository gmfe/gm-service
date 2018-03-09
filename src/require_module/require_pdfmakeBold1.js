import {asyncLoadJS} from '../async_load_js';

function requirePdfmakeBold1(callback) {
    asyncLoadJS('pdfmakeBold1', () => {
        require.ensure([], function (require) {
            const res = require('pdfmakeBold1');
            callback(res);
        });
    });
}

export default requirePdfmakeBold1;

