"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var api_1 = tslib_1.__importDefault(require("./api"));
var cookie_store_1 = tslib_1.__importDefault(require("./cookie-store"));
/**
 * 微信 Cookie 代理
 */
var cookieStore = (function () {
    // 创建 cookieStore 实例
    var cookieStore = new cookie_store_1.default();
    /**
     * 定义请求 cookie 代理函数
     * @param  {Object} options 请求参数
     */
    function cookieRequestProxy(options) {
        // 是否启用 cookie（默认 true）
        options.cookie = options.cookie === undefined || !!options.cookie;
        // 数据类型
        options.dataType = options.dataType || 'json';
        options.header = options.headers = options.header || options.headers || {};
        options.header['X-Requested-With'] = 'XMLHttpRequest';
        if (options.dataType === 'json') {
            options.header.Accept = 'application/json, text/plain, */*';
        }
        // 判断在小程序环境是否启用 cookie
        if (api_1.default.platform !== 'h5' && options.cookie) {
            // 域名
            var domain_1 = (options.url || '').split('/')[2];
            var path = options.url.split(domain_1).pop();
            // 获取请求 cookies
            var requestCookies = cookieStore.getRequestCookies(domain_1, path);
            // 请求时带上设置的 cookies
            options.header.Cookie = requestCookies;
            // 请求成功回调
            var successCallback_1 = options.success;
            options.success = function (response) {
                response.header = response.header || response.headers;
                // 获取响应 cookies
                var responseCookies = response.header ? response.header['Set-Cookie'] || response.header['set-cookie'] : '';
                if (responseCookies) {
                    // 处理QQ小程序下cookie分隔符问题：https://github.com/charleslo1/weapp-cookie/issues/39
                    // eslint-disable-next-line no-useless-escape
                    responseCookies = responseCookies.replace(/\;([^\s\;]*?(?=\=))/gi, ',$1');
                    // 设置 cookies，以便下次请求带上
                    cookieStore.setResponseCookies(responseCookies, domain_1);
                }
                // 调用成功回调函数
                successCallback_1 && successCallback_1(response);
            };
        }
        console.log('this: ...', this);
        // 发送网络请求
        return this(options);
    }
    // 绑定新的
    var requestProxy = cookieRequestProxy.bind(api_1.default.request);
    var uploadFileProxy = cookieRequestProxy.bind(api_1.default.uploadFile);
    var downloadFileProxy = cookieRequestProxy.bind(api_1.default.downloadFile);
    try {
        // 增加 requestWithCookie、uploadFileWithCookie、downloadFileWithCookie 接口
        Object.defineProperties(api_1.default, {
            // request
            requestWithCookie: {
                value: requestProxy,
            },
            // uploadFile
            uploadFileWithCookie: {
                value: uploadFileProxy,
            },
            // downloadFile
            downloadFileWithCookie: {
                value: downloadFileProxy,
            },
        });
        // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
        Object.defineProperties(api_1.default, {
            // request
            request: {
                value: requestProxy,
            },
            // uploadFile
            uploadFile: {
                value: uploadFileProxy,
            },
            // downloadFile
            downloadFile: {
                value: downloadFileProxy,
            },
        });
    }
    catch (err) {
        console.error('weapp-cookie: ', err);
    }
    // 配置
    cookieStore.config = function (options) {
        options = Object.assign({
            requestAlias: 'requestWithCookie',
            uploadFileAlias: 'uploadFileWithCookie',
            downloadFileAlias: 'downloadFileWithCookie',
        }, options);
        // 配置请求别名
        if (options.requestAlias) {
            Object.defineProperty(api_1.default, options.requestAlias, { value: requestProxy });
        }
        if (options.uploadFileAlias) {
            Object.defineProperty(api_1.default, options.uploadFileAlias, { value: uploadFileProxy });
        }
        if (options.downloadFileAlias) {
            Object.defineProperty(api_1.default, options.downloadFileAlias, { value: downloadFileProxy });
        }
    };
    // 返回 cookieStore
    return cookieStore;
})();
// 导出 cookieStore 实例
exports.default = cookieStore;
//# sourceMappingURL=cookie-shim.js.map