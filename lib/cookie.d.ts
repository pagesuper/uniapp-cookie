/**
 * Cookie 类
 */
declare class Cookie {
    name: any;
    value: any;
    domain: any;
    path: any;
    expires: Date | null;
    maxAge: number | null;
    httpOnly: boolean;
    dateTime: Date;
    /**
     * 构造函数
     */
    constructor(props: any);
    /**
     * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
     */
    set(setCookieStr?: string): this;
    /**
     * 合并 cookie
     * @param  {Cookie} cookie cookie 对象
     * @return {Cookie}        this
     */
    merge(cookie: any): any;
    /**
     * 验证 cookie 是否还有效
     * @return {Boolean} 是否有效
     */
    isExpired(): boolean;
    /**
     * 验证 cookie 是否可持久化
     * @return {Boolean} 是否可持久化
     */
    isPersistence(): boolean;
    /**
     * 验证 cookie 是否在指定的 domain 范围内
     * @param  {String}  domain    域名
     * @return {Boolean}           是否在指定的 domain 范围内
     */
    isInDomain(domain: any): boolean;
    /**
     * 验证 cookie 是否在指定的 path 范围内
     * @param  {String}  path    url路径
     * @return {Boolean}         是否在指定的 path 范围内
     */
    isInPath(path: string): boolean;
    /**
     * 重写对象的 toString 方法
     */
    toString(): string;
}
export default Cookie;
