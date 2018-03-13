import _ from 'lodash';
import { loadScript } from 'gm-util';

const config = [
    {name: 'xlsx', depUrl: '//js.guanmai.cn/build/libs/node_modules/xlsx/dist/xlsx.full.min.js'},
    {name: 'echarts', depUrl: '//js.guanmai.cn/build/libs/echarts/4.0.4/dist/echarts.min.js'},
    {name: 'baidumapApi', depUrl: '//api.map.baidu.com/api?v=2.0&ak=uRIgQnOKFQ77LLvuI9WzNgri'},
    {name: 'baidumapLushu', depUrl: '//api.map.baidu.com/library/LuShu/1.2/src/LuShu_min.js'},
    {name: 'pdfmake', depUrl: '//js.guanmai.cn/build/libs/node_modules/gm-pdfmake/build/pdfmake.min.js?v=0.2.16'},
    {name: 'pdfmakeRegular0', depUrl: '//js.guanmai.cn/build/libs/node_modules/gm-pdfmake/build/splits/regular-0.js?v=0.2.16'},
    {name: 'pdfmakeRegular1', depUrl: '//js.guanmai.cn/build/libs/node_modules/gm-pdfmake/build/splits/regular-1.js?v=0.2.16'},
    {name: 'pdfmakeBold0', depUrl: '//js.guanmai.cn/build/libs/node_modules/gm-pdfmake/build/splits/bold-0.js?v=0.2.16'},
    {name: 'pdfmakeBold1', depUrl: '//js.guanmai.cn/build/libs/node_modules/gm-pdfmake/build/splits/bold-1.js?v=0.2.16'}
];

const asyncLoadJS = (conf, callback) =>  {
    const target = _.find(config, val => val.name === conf);

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