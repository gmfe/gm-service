import {asyncLoadJS} from '../async_load_js';

function requirePdfmakeRegular1(callback) {
    asyncLoadJS('pdfmakeRegular1', () => {
        require.ensure([], function (require) {
            const res = require('pdfmakeRegular1');
            callback(res);
        });
    });
}

export default requirePdfmakeRegular1;

