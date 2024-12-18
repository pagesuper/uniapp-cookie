"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Util 类
 */
var Util = /** @class */ (function () {
    function Util() {
    }
    /**
     * 根据域名获取该域名的 cookie 作用域范围列表
     * @param  {String} domain 指定域名
     * @return {String}        cookie 作用域范围列表
     */
    Util.prototype.getCookieScopeDomain = function (domain) {
        if (domain === void 0) { domain = ''; }
        if (!domain)
            return [];
        // 获取 cookie 作用域范围列表
        domain = domain.replace(/^\.+/gi, '');
        var scopes = domain.split('.').map(function (k) { return ['.', domain.slice(domain.indexOf(k))].join(''); });
        return [domain].concat(scopes);
    };
    /**
     * 根据最新的 RFC 6265 标准化域名作用域
     * @param  {String} domain 域名
     * @return {String}        标准化后的域名
     */
    Util.prototype.normalizeDomain = function (domain) {
        if (domain === void 0) { domain = ''; }
        return domain.replace(/^(\.*)?(?=\S)/gi, '.');
    };
    return Util;
}());
exports.default = new Util();
//# sourceMappingURL=util.js.map