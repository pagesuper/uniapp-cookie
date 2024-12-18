"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var set_cookie_parser_1 = tslib_1.__importDefault(require("set-cookie-parser"));
var cookie_1 = tslib_1.__importDefault(require("./cookie"));
var local_storage_1 = tslib_1.__importDefault(require("./local-storage"));
var util_1 = tslib_1.__importDefault(require("./util"));
/**
 * CookieStore 类
 */
var CookieStore = /** @class */ (function () {
    /**
     * 构造函数
     */
    function CookieStore() {
        // storageKey
        this.__storageKey = '__cookie_store__';
        // cookies Map缓存（domain -> cookie 二级结构）
        this.__cookiesMap = this.__readFromStorage() || new Map();
    }
    /**
     * 是否存在某个 cookie
     * @param  {String}  name       cookie 名称
     * @param  {String}  [domain]   指定域名（可选）
     * @param  {String}  [path]     指定path（可选）
     * @return {Boolean}            是否存在
     */
    CookieStore.prototype.has = function (name, domain, path) {
        // 返回是否存在 cookie 值
        return this.getCookie(name, domain, path) !== undefined;
    };
    /**
     * 获取 cookie 值
     * @param {String} name       cookie 名称
     * @param {String} [domain]   指定域名（可选）
     * @param {String} [path]     指定path（可选）
     * @return {String}           cookie 值
     */
    CookieStore.prototype.get = function (name, domain, path) {
        if (name === void 0) { name = ''; }
        if (domain === void 0) { domain = ''; }
        if (path === void 0) { path = '/'; }
        // 获取 cookie
        var cookie = this.getCookie(name, domain, path);
        // 返回 cookie 值
        return cookie ? cookie.value : undefined;
    };
    /**
     * 设置域名 cookie
     * @param {String}  name              cookie 名称
     * @param {String}  value             cookie 值
     * @param {Object}  options           cookie 选项
     * @param {String}  options.domain
     * @param {String}  [options.path]
     * @param {Date}    [options.expires]
     * @param {Number}  [options.maxAge]
     * @param {Boolean} [options.httpOnly]
     * @return {Cookie}           cookie 对象
     */
    CookieStore.prototype.set = function (name, value, options) {
        if (name === void 0) { name = ''; }
        if (value === void 0) { value = ''; }
        if (options === void 0) { options = {}; }
        // 构建 Cookie 实例
        var domain = options.domain;
        if (!domain || !name)
            throw new Error('name 和 options.domain 值不正确！');
        var cookie = new cookie_1.default(Object.assign(options, {
            name: name,
            value: value,
        }));
        // 设置到指定域名
        var cookies = this.__cookiesMap.get(domain) || new Map();
        cookies.set(name, cookie);
        this.__cookiesMap.set(domain, cookies);
        // 保存到 Storage
        this.__saveToStorage();
        return cookie;
    };
    /**
     * 获取所有域名和 cookies 结构
     * @return {Object}  obj  结构JSON对象
     */
    CookieStore.prototype.dir = function () {
        var dirObj = {};
        for (var _i = 0, _a = Array.from(this.__cookiesMap.keys()); _i < _a.length; _i++) {
            var domain = _a[_i];
            Reflect.set(dirObj, domain, this.getCookies(domain));
        }
        return dirObj;
    };
    /**
     * 删除 cookie
     * @param  {Array}  name      cookie 键
     * @param  {String} [domain]  指定域名（可选）
     * @return {Boolean}          是否删除成功
     */
    CookieStore.prototype.remove = function (name, domain) {
        if (name === void 0) { name = ''; }
        if (domain === void 0) { domain = ''; }
        if (domain) {
            // 删除指定域名的 cookie
            var cookies = this.__cookiesMap.get(domain);
            cookies && cookies.delete(name);
            cookies = this.__cookiesMap.get(util_1.default.normalizeDomain(domain));
            cookies && cookies.delete(name);
        }
        else {
            // 删除所有域名的 cookie
            for (var _i = 0, _a = Array.from(this.__cookiesMap.values()); _i < _a.length; _i++) {
                var cookies = _a[_i];
                cookies.delete(name);
            }
        }
        // 保存到 Storage
        this.__saveToStorage();
        return true;
    };
    /**
     * 获取 cookie 对象
     * @param {String} name       cookie 名称
     * @param {String} [domain]   指定域名（可选）
     * @param {String} [path]     指定path（可选）
     * @return {Cookie}           cookie 对象
     */
    CookieStore.prototype.getCookie = function (name, domain, path) {
        if (name === void 0) { name = ''; }
        if (domain === void 0) { domain = ''; }
        if (path === void 0) { path = '/'; }
        var cookie;
        // 获取 cookie scope 域名数组
        var scopeDomains = util_1.default.getCookieScopeDomain(domain);
        // 获取任意域名的 cookie
        for (var _i = 0, _a = Array.from(this.__cookiesMap.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], cookies = _b[1];
            // 如果有域名，则根据域名过滤
            if (domain && scopeDomains.indexOf(key) < 0)
                continue;
            // 获取 cookie
            cookie = cookies.get(name);
            if (cookie && cookie.isInPath(path) && !cookie.isExpired())
                break;
            cookie = undefined;
        }
        // 返回 cookie 值
        return cookie;
    };
    /**
     * 获取 cookies key/value 对象
     * @param  {String} [domain]  指定域名（可选）
     * @return {Object}           cookie 值列表对象
     */
    CookieStore.prototype.getCookies = function (domain, path) {
        var cookieValues = {};
        // 将 cookie 值添加到对象
        this.getCookiesArray(domain, path).forEach(function (cookie) {
            Reflect.set(cookieValues, cookie.name, cookie.value);
        });
        // 返回获取的 cookie 值对象
        return cookieValues;
    };
    /**
     * 获取 cookies 对象数组
     * @param  {String} [domain]  指定域名（可选）
     * @return {Array}            Cookie 对象数组
     */
    CookieStore.prototype.getCookiesArray = function (domain, path) {
        if (domain === void 0) { domain = ''; }
        if (path === void 0) { path = '/'; }
        var cookiesArr = [];
        // 获取 cookie scope 域名数组
        var scopeDomains = util_1.default.getCookieScopeDomain(domain);
        // 获取任意域名的 cookie
        for (var _i = 0, _a = Array.from(this.__cookiesMap.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], cookies = _b[1];
            // 如果有域名，则根据域名过滤
            if (domain && scopeDomains.indexOf(key) < 0)
                continue;
            // 循环当前域名下所有 cookie
            for (var _c = 0, _d = Array.from(cookies.values()); _c < _d.length; _c++) {
                var cookie = _d[_c];
                // 筛选符合 path 条件并且未过期的 cookie
                if (cookie.isInPath(path) && !cookie.isExpired()) {
                    cookiesArr.push(cookie);
                }
            }
        }
        // 返回获取的 cookie 值对象
        return cookiesArr;
    };
    /**
     * 设置 cookies 对象数组到 store
     * @param  {Array} cookies  Cookie 对象数组
     * @return {Map}            cookies Map 对象
     */
    CookieStore.prototype.setCookiesArray = function (cookies) {
        var _this = this;
        if (cookies === void 0) { cookies = []; }
        this.__cookiesMap = this.__cookiesMap || new Map();
        // Cookie 数组转换 Map 对象
        cookies.forEach(function (cookie) {
            var cookieMap = _this.__cookiesMap.get(cookie.domain);
            if (!cookieMap) {
                cookieMap = new Map();
                _this.__cookiesMap.set(cookie.domain, cookieMap);
            }
            cookieMap.set(cookie.name, cookie);
        });
        // 保存到 Storage
        this.__saveToStorage();
        return this.__cookiesMap;
    };
    /**
     * 清除 cookies
     * @param  {String} [domain]  指定域名（可选）
     * @return {Boolean}          是否清除成功
     */
    CookieStore.prototype.clearCookies = function (domain) {
        if (domain) {
            var cookies = this.__cookiesMap.get(domain);
            cookies && cookies.clear();
        }
        else {
            this.__cookiesMap.clear();
        }
        // 保存到 Storage
        this.__saveToStorage();
        return true;
    };
    /**
     * 获取 request cookies
     * @param  {String} domain 指定域名
     * @return {String}        request cookies 字符串
     */
    CookieStore.prototype.getRequestCookies = function (domain, path) {
        // cookies 数组
        var cookiesArr = this.getCookiesArray(domain, path);
        // 转化为 request cookies 字符串
        return this.stringify(cookiesArr);
    };
    /**
     * 设置 response cookies
     * @param {String} setCookieStr response set-cookie 字符串
     * @param {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
     */
    CookieStore.prototype.setResponseCookies = function (setCookieStr, domain) {
        // 转换为 cookie 对象数组
        var parsedCookies = this.parse(setCookieStr, domain);
        // 设置 cookies
        return this.setCookiesArray(parsedCookies);
    };
    /**
     * 解析 response set-cookie 字段
     * @param  {String} setCookieStr response set-cookie 字符串
     * @param  {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
     * @return {Array}               Cookie 对象数组
     */
    CookieStore.prototype.parse = function (setCookieStr, domain) {
        if (setCookieStr === void 0) { setCookieStr = ''; }
        // parse
        var cookies = set_cookie_parser_1.default.parse(set_cookie_parser_1.default.splitCookiesString(setCookieStr), { decodeValues: false });
        // 转换为 Cookie 对象
        return cookies.map(function (item) {
            item.domain = util_1.default.normalizeDomain(item.domain) || domain;
            return new cookie_1.default(item);
        });
    };
    /**
     * 将 cookies 字符串化，转化为 request cookies 字符串
     * @param  {Array} cookies Cookie 对象数组
     * @return {String}        cookie 字符串
     */
    CookieStore.prototype.stringify = function (cookies) {
        return cookies.map(function (item) { return item.toString(); }).join('; ');
    };
    /**
     * 将 cookies 保存到 Storage
     */
    CookieStore.prototype.__saveToStorage = function () {
        try {
            var saveCookies = [];
            // 获取需要持久化的 cookie
            for (var _i = 0, _a = Array.from(this.__cookiesMap.values()); _i < _a.length; _i++) {
                var cookies = _a[_i];
                for (var _b = 0, _c = Array.from(cookies.values()); _b < _c.length; _b++) {
                    var cookie = _c[_b];
                    if (cookie.isExpired()) {
                        // 清除无效 cookie
                        cookies.delete(cookie.name);
                    }
                    else if (cookie.isPersistence()) {
                        // 只存储可持久化 cookie
                        saveCookies.push(cookie);
                    }
                }
            }
            // 保存到本地存储
            local_storage_1.default.setItem(this.__storageKey, saveCookies);
        }
        catch (err) {
            console.warn('Cookie write fail：', err);
        }
    };
    /**
     * 从 Storage 读取 cookies
     */
    CookieStore.prototype.__readFromStorage = function () {
        try {
            // 从本地存储读取 cookie 数据数组
            var cookies = local_storage_1.default.getItem(this.__storageKey) || [];
            // 转化为 Cookie 对象数组
            cookies = cookies.map(function (item) { return new cookie_1.default(item); });
            // 转化为 cookie map 对象
            return this.setCookiesArray(cookies);
        }
        catch (err) {
            console.warn('Cookie read fail：', err);
        }
    };
    return CookieStore;
}());
exports.default = CookieStore;
//# sourceMappingURL=cookie-store.js.map