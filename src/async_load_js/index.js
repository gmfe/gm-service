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
    'gm-pdfmake': {
        depUrl: '//js.guanmai.cn/build/libs/gm-pdfmake/0.3.10/build/pdfmake.min.js',
        isReady: false
    },
    'gm-pdfmake-font-bold-0': {
        depUrl: '//static.guanmai.cn/build/libs/gm-pdfmake/0.3.10/build/splits/bold_0.js',
        isReady: false
    },
    'gm-pdfmake-font-bold-1': {
        depUrl: '//static.guanmai.cn/build/libs/gm-pdfmake/0.3.10/build/splits/bold_1.js',
        isReady: false
    },
    
    'gm-pdfmake-font-regular-0': {
        depUrl: '//static.guanmai.cn/build/libs/gm-pdfmake/0.3.10/build/splits/regular_0.js',
        isReady: false
    },
    'gm-pdfmake-font-regular-1': {
        depUrl: '//static.guanmai.cn/build/libs/gm-pdfmake/0.3.10/build/splits/regular_1.js',
        isReady: false
    }
};

const asyncLoadJS = function(conf, callback){
    if (Object.prototype.toString.call(conf) === "[object Array]") {
        return Promise.all(
            conf.map(item => {
                return new Promise(resolve => {
                    loadFunc(item, resolve);
                }); 
            })
        );
    } else {
        loadFunc(conf, callback);
    }

    function loadFunc (url, callback) {
        const target = config[url];

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
    }

};


export {
    asyncLoadJS
};