/**
 * Util 类
 */
declare class Util {
    /**
     * 根据域名获取该域名的 cookie 作用域范围列表
     * @param  {String} domain 指定域名
     * @return {String}        cookie 作用域范围列表
     */
    getCookieScopeDomain(domain?: string): string[];
    /**
     * 根据最新的 RFC 6265 标准化域名作用域
     * @param  {String} domain 域名
     * @return {String}        标准化后的域名
     */
    normalizeDomain(domain?: string): string;
}
declare const _default: Util;
export default _default;
