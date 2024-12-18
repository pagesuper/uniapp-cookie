import Cookie from './cookie';
/**
 * CookieStore 类
 */
declare class CookieStore {
    config: ((options: {
        requestAlias: PropertyKey;
        uploadFileAlias: PropertyKey;
        downloadFileAlias: PropertyKey;
    }) => void) | undefined;
    private __storageKey;
    private __cookiesMap;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 是否存在某个 cookie
     * @param  {String}  name       cookie 名称
     * @param  {String}  [domain]   指定域名（可选）
     * @param  {String}  [path]     指定path（可选）
     * @return {Boolean}            是否存在
     */
    has(name?: string, domain?: string, path?: string): boolean;
    /**
     * 获取 cookie 值
     * @param {String} name       cookie 名称
     * @param {String} [domain]   指定域名（可选）
     * @param {String} [path]     指定path（可选）
     * @return {String}           cookie 值
     */
    get(name?: string, domain?: string, path?: string): any;
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
    set(name?: string, value?: string, options?: {
        domain?: string;
    }): Cookie;
    /**
     * 获取所有域名和 cookies 结构
     * @return {Object}  obj  结构JSON对象
     */
    dir(): {};
    /**
     * 删除 cookie
     * @param  {Array}  name      cookie 键
     * @param  {String} [domain]  指定域名（可选）
     * @return {Boolean}          是否删除成功
     */
    remove(name?: string, domain?: string): boolean;
    /**
     * 获取 cookie 对象
     * @param {String} name       cookie 名称
     * @param {String} [domain]   指定域名（可选）
     * @param {String} [path]     指定path（可选）
     * @return {Cookie}           cookie 对象
     */
    getCookie(name?: string, domain?: string, path?: string): Cookie | undefined;
    /**
     * 获取 cookies key/value 对象
     * @param  {String} [domain]  指定域名（可选）
     * @return {Object}           cookie 值列表对象
     */
    getCookies(domain?: string, path?: string): {};
    /**
     * 获取 cookies 对象数组
     * @param  {String} [domain]  指定域名（可选）
     * @return {Array}            Cookie 对象数组
     */
    getCookiesArray(domain?: string, path?: string): Cookie[];
    /**
     * 设置 cookies 对象数组到 store
     * @param  {Array} cookies  Cookie 对象数组
     * @return {Map}            cookies Map 对象
     */
    setCookiesArray(cookies?: any[]): Map<string, Map<string, Cookie>>;
    /**
     * 清除 cookies
     * @param  {String} [domain]  指定域名（可选）
     * @return {Boolean}          是否清除成功
     */
    clearCookies(domain: any): boolean;
    /**
     * 获取 request cookies
     * @param  {String} domain 指定域名
     * @return {String}        request cookies 字符串
     */
    getRequestCookies(domain: string | undefined, path: string | undefined): string;
    /**
     * 设置 response cookies
     * @param {String} setCookieStr response set-cookie 字符串
     * @param {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
     */
    setResponseCookies(setCookieStr: string | undefined, domain: string): Map<string, Map<string, Cookie>>;
    /**
     * 解析 response set-cookie 字段
     * @param  {String} setCookieStr response set-cookie 字符串
     * @param  {String} domain       默认域名（如果 set-cookie 中没有设置 domain 则使用该域名）
     * @return {Array}               Cookie 对象数组
     */
    parse(setCookieStr: string | undefined, domain: any): Cookie[];
    /**
     * 将 cookies 字符串化，转化为 request cookies 字符串
     * @param  {Array} cookies Cookie 对象数组
     * @return {String}        cookie 字符串
     */
    stringify(cookies: any[]): string;
    /**
     * 将 cookies 保存到 Storage
     */
    __saveToStorage(): void;
    /**
     * 从 Storage 读取 cookies
     */
    __readFromStorage(): Map<string, Map<string, Cookie>> | undefined;
}
export default CookieStore;
