import {asyncLoadJS} from '../async_load_js';

function requirePdfmakeRegular0(callback) {
    asyncLoadJS('pdfmakeRegular0', () => {
        require.ensure([], function (require) {
            const res = require('pdfmakeRegular0');
            callback(res);
        });
    });
}

export default requirePdfmakeRegular0;

