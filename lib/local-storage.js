"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var api_1 = tslib_1.__importDefault(require("./api"));
/**
 * LocalStorage 类
 */
var LocalStorage = /** @class */ (function () {
    function LocalStorage() {
    }
    /**
     * 获取数据项
     * @param {String} key   键
     */
    LocalStorage.prototype.getItem = function (key) {
        // 屏蔽支付宝小程序语法差异
        if (api_1.default.platform === 'my') {
            return api_1.default.getStorageSync({ key: key }).data;
        }
        return api_1.default.getStorageSync(key);
    };
    /**
     * 设置数据项
     * @param {String} key   键
     * @param {Any} value 值
     */
    LocalStorage.prototype.setItem = function (key, value) {
        // 屏蔽支付宝小程序语法差异
        if (api_1.default.platform === 'my') {
            return api_1.default.setStorageSync({ key: key, data: value });
        }
        return api_1.default.setStorageSync(key, value);
    };
    return LocalStorage;
}());
// 单例
exports.default = new LocalStorage();
//# sourceMappingURL=local-storage.js.map