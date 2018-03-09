import { loadScript } from 'gm-util';

const config = {
    'xlsx': {
        depUrl: '//js.guanmai.cn/build/libs/node_modules/xlsx/dist/xlsx.full.min.js',
        isReady: false
    },
    'echarts': {
        depUrl: '//js.guanmai.cn/build/libs/echarts/4.0.4/dist/echarts.min.js',
        isReady: false
    },
    'baidumapApi': {
        depUrl: '//api.map.baidu.com/api?v=2.0&ak=uRIgQnOKFQ77LLvuI9WzNgri',
        isReady: false
    },
    'baidumapLushu': {
        depUrl: '//api.map.baidu.com/library/LuShu/1.2/src/LuShu_min.js',
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