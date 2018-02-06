import { loadScript } from 'gm-util';

const config = {
    'xlsx': {
        depUrl: '//js.guanmai.cn/build/libs/node_modules/xlsx/dist/xlsx.full.min.js',
        isReady: false
    }
};

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