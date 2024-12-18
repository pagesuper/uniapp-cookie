"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var set_cookie_parser_1 = tslib_1.__importDefault(require("set-cookie-parser"));
var util_1 = tslib_1.__importDefault(require("./util"));
/**
 * Cookie 类
 */
var Cookie = /** @class */ (function () {
    /**
     * 构造函数
     */
    function Cookie(props) {
        this.name = props.name || '';
        this.value = props.value || '';
        // other
        this.domain = props.domain || '';
        this.path = props.path || '/';
        this.expires = props.expires ? new Date(props.expires) : null;
        this.maxAge = props.maxAge ? parseInt(props.maxAge) : null;
        this.httpOnly = !!props.httpOnly;
        // 记录时间
        this.dateTime = props.dateTime ? new Date(props.dateTime) : new Date();
    }
    /**
     * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
     */
    Cookie.prototype.set = function (setCookieStr) {
        if (setCookieStr === void 0) { setCookieStr = ''; }
        var cookie = set_cookie_parser_1.default.parse(setCookieStr, { decodeValues: false })[0];
        if (cookie) {
            Object.assign(this, cookie);
            // 更新设置时间
            this.dateTime = new Date();
        }
        return this;
    };
    /**
     * 合并 cookie
     * @param  {Cookie} cookie cookie 对象
     * @return {Cookie}        this
     */
    Cookie.prototype.merge = function (cookie) {
        return Object.assign(this, cookie);
    };
    /**
     * 验证 cookie 是否还有效
     * @return {Boolean} 是否有效
     */
    Cookie.prototype.isExpired = function () {
        // maxAge 为 0，无效
        if (this.maxAge === 0) {
            return true;
        }
        // 存活秒数超出 maxAge，无效
        if (this.maxAge !== null && this.maxAge > 0) {
            var seconds = (Date.now() - this.dateTime.getTime()) / 1000;
            return seconds > this.maxAge;
        }
        // expires 小于当前时间，无效
        if (this.expires && this.expires < new Date()) {
            return true;
        }
        return false;
    };
    /**
     * 验证 cookie 是否可持久化
     * @return {Boolean} 是否可持久化
     */
    Cookie.prototype.isPersistence = function () {
        return this.maxAge ? this.maxAge > 0 : true;
    };
    /**
     * 验证 cookie 是否在指定的 domain 范围内
     * @param  {String}  domain    域名
     * @return {Boolean}           是否在指定的 domain 范围内
     */
    Cookie.prototype.isInDomain = function (domain) {
        var scopeDomains = util_1.default.getCookieScopeDomain(domain);
        return scopeDomains.indexOf(this.domain) >= 0;
    };
    /**
     * 验证 cookie 是否在指定的 path 范围内
     * @param  {String}  path    url路径
     * @return {Boolean}         是否在指定的 path 范围内
     */
    Cookie.prototype.isInPath = function (path) {
        return path.indexOf(this.path) === 0 || this.path.replace(/\/$/, '') === path;
    };
    /**
     * 重写对象的 toString 方法
     */
    Cookie.prototype.toString = function () {
        return [this.name, this.value].join('=');
    };
    return Cookie;
}());
exports.default = Cookie;
//# sourceMappingURL=cookie.js.map