const config = {
    'xlsx': {
        depUrl: '//js.guanmai.cn/build/libs/node_modules/xlsx/dist/xlsx.full.min.js',
        isReady: false
    }
};

function loadScript (url, cb) {
    const elem = window.document.createElement('script');
    elem.type = 'text/javascript';
    elem.charset = 'utf-8';
    elem.addEventListener('load', cb, false);
    elem.src = url;
    window.document.body.appendChild(elem);
}

const asyncLoadJS = function(conf, callback){
    const target = config[conf];

    if (!target) {
        console.error('模块不存在');
        return;
    }

    if (target.isReady) {
        // 已经加载过
        setTimeout(() => {
            callback();
        }, 0);
        return;
    }

    if (!target.depUrl) {
        // 没有外部依赖
        setTimeout(() => {
            callback();
        }, 0);
    } else {
        loadScript(target.depUrl, () => {
            target.isReady = true;
            callback();
        });
    }
};

export {
    asyncLoadJS
};