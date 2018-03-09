import {asyncLoadJS} from '../async_load_js';

function requirePdfmake(callback) {
    asyncLoadJS('pdfmake', () => {
        require.ensure([], function (require) {
            const res = require('pdfmake');
            callback(res);
        });
    });
}

export default requirePdfmake;

