"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var set_cookie_parser_1 = (0, tslib_1.__importDefault)(require("./set-cookie-parser"));
var util_1 = (0, tslib_1.__importDefault)(require("./util"));
/**
 * Cookie 类
 */
var Cookie = /** @class */ (function () {
    /**
     * 构造函数
     */
    function Cookie(props) {
        var _a;
        this.name = props.name || '';
        this.value = props.value || '';
        // other
        this.domain = props.domain || '';
        this.path = props.path || '/';
        this.expires = props.expires ? this.getDateTime(props.expires) : null;
        this.maxAge = props.maxAge ? parseInt(props.maxAge) : null;
        this.httpOnly = !!props.httpOnly;
        // 记录时间
        this.dateTime = (_a = (props.dateTime ? this.getDateTime(props.dateTime) : null)) !== null && _a !== void 0 ? _a : new Date();
    }
    Cookie.prototype.getDateTime = function (dateStr) {
        // 1. 处理空值和无效输入
        if (dateStr == null)
            return null;
        // 2. 如果已经是Date对象直接返回
        if (dateStr instanceof Date) {
            return isNaN(dateStr.getTime()) ? null : new Date(dateStr);
        }
        // 3. 如果是数字时间戳
        if (typeof dateStr === 'number') {
            var date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        }
        // 4. 确保是字符串类型
        var str = String(dateStr).trim();
        if (!str)
            return null;
        // 5. 尝试解析 RFC 2822 格式 (Fri, 08 May 2026 08:55:36 GMT)
        var rfc2822Match = str.match(/^[A-Za-z]{3}, (\d{1,2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/i);
        if (rfc2822Match) {
            var day = rfc2822Match[1], month_1 = rfc2822Match[2], year = rfc2822Match[3], time = rfc2822Match[4];
            var monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].findIndex(function (m) { return m.toLowerCase() === month_1.toLowerCase(); });
            if (monthIndex === -1)
                return null;
            var _a = time.split(':').map(Number), hours = _a[0], minutes = _a[1], seconds = _a[2];
            var date = new Date(Date.UTC(Number(year), monthIndex, Number(day), hours, minutes, seconds));
            return isNaN(date.getTime()) ? null : date;
        }
        // 6. 尝试解析其他常见格式
        // 6.1 ISO 8601 格式 (2023-05-15T12:00:00Z)
        if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/i.test(str)) {
            var date = new Date(str);
            return isNaN(date.getTime()) ? null : date;
        }
        // 6.2 简单日期格式 (May 08 2026 08:55:36 GMT)
        var simpleDateMatch = str.match(/^([A-Za-z]{3}) (\d{1,2}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/i);
        if (simpleDateMatch) {
            var month_2 = simpleDateMatch[1], day = simpleDateMatch[2], year = simpleDateMatch[3], time = simpleDateMatch[4];
            var monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].findIndex(function (m) { return m.toLowerCase() === month_2.toLowerCase(); });
            if (monthIndex === -1)
                return null;
            var _b = time.split(':').map(Number), hours = _b[0], minutes = _b[1], seconds = _b[2];
            var date = new Date(Date.UTC(Number(year), monthIndex, Number(day), hours, minutes, seconds));
            return isNaN(date.getTime()) ? null : date;
        }
        // 7. 最后尝试原生Date解析
        try {
            var date = new Date(str);
            return isNaN(date.getTime()) ? null : date;
        }
        catch (_c) {
            return null;
        }
    };
    /**
     * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
     */
    Cookie.prototype.set = function (setCookieStr) {
        if (setCookieStr === void 0) { setCookieStr = ''; }
        var cookies = set_cookie_parser_1.default.parse(setCookieStr, { decodeValues: false });
        if (Array.isArray(cookies) && cookies.length > 0) {
            Object.assign(this, cookies[0]);
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