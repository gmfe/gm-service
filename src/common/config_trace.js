import {RequestInterceptor} from 'gm-util';

// 要求 reqeust config headers 中含 X-Guanmai-Request-Id X-Guanmai-Client
// 要求 __DEBUG__ 存在

// 请求统计需要
function configTrace(platform, options) {

    options = Object.assign({}, {
        extension: {
            origin: window.location.href,
            branch: window.____fe_branch,
            commit: window.____git_commit,
            username: window.g_user && window.g_user.name,
            group: window.g_partner_id === undefined ? window.g_group_id : window.g_partner_id,
            cms: window.g_cms_config && window.g_cms_config.key
        }
    }, options);

    const timeMap = {};
    RequestInterceptor.add({
        request(config) {
            const uuid = config.options.headers['X-Guanmai-Request-Id'];
            timeMap[uuid] = Date.now();

            return config;
        },
        response(json, config) {
            const isSuccess = config.sucCode.indexOf(json.code) > -1;
            const uuid = config.options.headers['X-Guanmai-Request-Id'];

            feed({
                url: config.url,
                code: json.code,
                isSuccess,
                time: Date.now() - timeMap[uuid],
                msg: json.msg,
                client: config.options.headers['X-Guanmai-Client'],
                requestId: uuid
            });

            return json;
        },
        responseError(reason, config) {
            const uuid = config.options.headers['X-Guanmai-Request-Id'];

            feed({
                url: config.url,
                code: null,
                isSuccess: false,
                time: Date.now() - timeMap[uuid],
                msg: reason + '',
                client: config.options.headers['X-Guanmai-Client'],
                requestId: uuid
            });
        }
    });

    // dev devhost
    const noTest = window.location.host.indexOf('dev.guanmai.cn') === -1 && window.location.host.indexOf('devhost.guanmai.cn') === -1;

    function feed(data) { // url: String!, code: Int!, isSuccess: Boolean, time: Int, msg: String, client: String, requestId: String, origin: String
        // 异步，不阻塞
        setTimeout(() => {
            data = Object.assign({}, data, {
                extension: JSON.stringify(options.extension)
            });

            const arr = [];
            for (let key in data) {
                arr.push(key + ':' + JSON.stringify(data[key] === undefined ? null : data[key]));
            }

            if (__DEBUG__) { // eslint-disable-line
                console.log(`graphql/request/${platform}`, data, arr.join(','));
            } else if (noTest) {
                new window.Image().src = `//trace.guanmai.cn/graphql/request/${platform}?query={createRequest(${window.encodeURIComponent(arr.join(','))}){url}}`;
            }
        }, 10);
    }
}

export default configTrace;