/**
 * LocalStorage 类
 */
declare class LocalStorage {
    /**
     * 获取数据项
     * @param {String} key   键
     */
    getItem(key: string): any;
    /**
     * 设置数据项
     * @param {String} key   键
     * @param {Any} value 值
     */
    setItem(key: string, value: any): any;
}
declare const _default: LocalStorage;
export default _default;
