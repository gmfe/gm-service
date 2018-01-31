import { is } from 'gm-util';

function setTitle(title) {
    window.document.title = title;

    if (!is.weixin()) {
        return;
    }

    const iframe = window.document.createElement('iframe');
    iframe.src = '../abcdefg.pgn';

    const listener = () => {
        setTimeout(() => {
            iframe.removeEventListener('load', listener);
            setTimeout(() => {
                window.document.body.removeChild(iframe);
            }, 0);
        }, 0);
    };
    iframe.addEventListener('load', listener);
    window.document.body.appendChild(iframe);
}

export default setTitle;