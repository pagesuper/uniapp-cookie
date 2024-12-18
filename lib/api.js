"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getApi() {
    if (typeof my !== 'undefined') {
        uni.platform = 'my';
        return uni;
    }
    else if (typeof tt !== 'undefined') {
        uni.platform = 'tt';
        return uni;
    }
    else if (typeof swan !== 'undefined') {
        uni.platform = 'swan';
        return uni;
    }
    else if (typeof qq !== 'undefined') {
        uni.platform = 'qq';
        return uni;
    }
    else if (typeof wx !== 'undefined') {
        uni.platform = typeof window !== 'undefined' && typeof location !== 'undefined' ? 'h5' : 'wx';
        return uni;
    }
    return { platform: 'none' };
}
exports.default = getApi();
//# sourceMappingURL=api.js.map