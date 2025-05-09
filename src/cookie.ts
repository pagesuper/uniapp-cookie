import setCookieParser from './set-cookie-parser';
import util from './util';

/**
 * Cookie 类
 */
class Cookie {
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
  constructor(props: any) {
    this.name = props.name || '';
    this.value = props.value || '';
    // other
    this.domain = props.domain || '';
    this.path = props.path || '/';
    this.expires = props.expires ? this.getDateTime(props.expires) : null;
    this.maxAge = props.maxAge ? parseInt(props.maxAge) : null;
    this.httpOnly = !!props.httpOnly;
    // 记录时间
    this.dateTime = (props.dateTime ? this.getDateTime(props.dateTime) : null) ?? new Date();
  }

  getDateTime(dateStr: string | Date | number | null | undefined): Date | null {
    // 1. 处理空值和无效输入
    if (dateStr == null) return null;

    // 2. 如果已经是Date对象直接返回
    if (dateStr instanceof Date) {
      return isNaN(dateStr.getTime()) ? null : new Date(dateStr);
    }

    // 3. 如果是数字时间戳
    if (typeof dateStr === 'number') {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    }

    // 4. 确保是字符串类型
    const str = String(dateStr).trim();
    if (!str) return null;

    // 5. 尝试解析 RFC 2822 格式 (Fri, 08 May 2026 08:55:36 GMT)
    const rfc2822Match = str.match(/^[A-Za-z]{3}, (\d{1,2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/i);
    if (rfc2822Match) {
      const [, day, month, year, time] = rfc2822Match;
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].findIndex(
        (m) => m.toLowerCase() === month.toLowerCase(),
      );
      if (monthIndex === -1) return null;

      const [hours, minutes, seconds] = time.split(':').map(Number);
      const date = new Date(Date.UTC(Number(year), monthIndex, Number(day), hours, minutes, seconds));
      return isNaN(date.getTime()) ? null : date;
    }

    // 6. 尝试解析其他常见格式
    // 6.1 ISO 8601 格式 (2023-05-15T12:00:00Z)
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/i.test(str)) {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    }

    // 6.2 简单日期格式 (May 08 2026 08:55:36 GMT)
    const simpleDateMatch = str.match(/^([A-Za-z]{3}) (\d{1,2}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/i);
    if (simpleDateMatch) {
      const [, month, day, year, time] = simpleDateMatch;
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].findIndex(
        (m) => m.toLowerCase() === month.toLowerCase(),
      );
      if (monthIndex === -1) return null;

      const [hours, minutes, seconds] = time.split(':').map(Number);
      const date = new Date(Date.UTC(Number(year), monthIndex, Number(day), hours, minutes, seconds));
      return isNaN(date.getTime()) ? null : date;
    }

    // 7. 最后尝试原生Date解析
    try {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * 设置 cookie, 将 set-cookie 字符串转换为 Cookie 对象
   */
  set(setCookieStr = '') {
    const cookies = setCookieParser.parse(setCookieStr, { decodeValues: false });
    if (Array.isArray(cookies) && cookies.length > 0) {
      Object.assign(this, cookies[0]);
      // 更新设置时间
      this.dateTime = new Date();
    }

    return this;
  }

  /**
   * 合并 cookie
   * @param  {Cookie} cookie cookie 对象
   * @return {Cookie}        this
   */
  merge(cookie: any) {
    return Object.assign(this, cookie);
  }

  /**
   * 验证 cookie 是否还有效
   * @return {Boolean} 是否有效
   */
  isExpired() {
    // maxAge 为 0，无效
    if (this.maxAge === 0) {
      return true;
    }
    // 存活秒数超出 maxAge，无效
    if (this.maxAge !== null && this.maxAge > 0) {
      const seconds = (Date.now() - this.dateTime.getTime()) / 1000;
      return seconds > this.maxAge;
    }
    // expires 小于当前时间，无效
    if (this.expires && this.expires < new Date()) {
      return true;
    }
    return false;
  }

  /**
   * 验证 cookie 是否可持久化
   * @return {Boolean} 是否可持久化
   */
  isPersistence() {
    return this.maxAge ? this.maxAge > 0 : true;
  }

  /**
   * 验证 cookie 是否在指定的 domain 范围内
   * @param  {String}  domain    域名
   * @return {Boolean}           是否在指定的 domain 范围内
   */
  isInDomain(domain: any) {
    const scopeDomains = util.getCookieScopeDomain(domain);
    return scopeDomains.indexOf(this.domain) >= 0;
  }

  /**
   * 验证 cookie 是否在指定的 path 范围内
   * @param  {String}  path    url路径
   * @return {Boolean}         是否在指定的 path 范围内
   */
  isInPath(path: string) {
    return path.indexOf(this.path) === 0 || this.path.replace(/\/$/, '') === path;
  }

  /**
   * 重写对象的 toString 方法
   */
  toString() {
    return [this.name, this.value].join('=');
  }
}

export default Cookie;
