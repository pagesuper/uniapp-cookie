'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var defaultParseOptions = {
    decodeValues: true,
    map: false,
    silent: false,
};
function isNonEmptyString(str) {
    return typeof str === 'string' && !!str.trim();
}
function parseNameValuePair(nameValuePairStr) {
    var nameValueArr = nameValuePairStr.split('=');
    if (nameValueArr.length > 1) {
        var name_1 = nameValueArr.shift();
        var value = nameValueArr.join('=');
        return { name: name_1, value: value };
    }
    return { name: '', value: nameValuePairStr };
}
function safeDateParseForIOS(expiresStr) {
    if (!expiresStr)
        return undefined;
    // Common cookie date formats and their iOS-compatible conversions
    var dateFormats = [
        // RFC 1123 (Thu, 01 Jan 1970 00:00:00 GMT)
        {
            regex: /^[A-Za-z]{3}, (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
            handler: function (match) { return "".concat(match[3], "/").concat(match[2], "/").concat(match[1], " ").concat(match[4]); },
        },
        // RFC 850 (Thursday, 01-Jan-70 00:00:00 GMT)
        {
            regex: /^[A-Za-z]{3,9}, (\d{2})-([A-Za-z]{3})-(\d{2,4}) (\d{2}:\d{2}:\d{2}) GMT$/,
            handler: function (match) {
                var year = match[3].length === 2 ? "19".concat(match[3]) : match[3];
                return "".concat(year, "/").concat(match[2], "/").concat(match[1], " ").concat(match[4]);
            },
        },
        // ANSI C's asctime() format (Thu Jan  1 00:00:00 1970)
        {
            regex: /^[A-Za-z]{3} ([A-Za-z]{3}) (\d{1,2}) (\d{2}:\d{2}:\d{2}) (\d{4})$/,
            handler: function (match) { return "".concat(match[4], "/").concat(match[1], "/").concat(match[2].padStart(2, '0'), " ").concat(match[3]); },
        },
        // Simple format (01 Jan 1970 00:00:00 GMT)
        {
            regex: /^(\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
            handler: function (match) { return "".concat(match[3], "/").concat(match[2], "/").concat(match[1], " ").concat(match[4]); },
        },
    ];
    // Try known formats first
    for (var _i = 0, dateFormats_1 = dateFormats; _i < dateFormats_1.length; _i++) {
        var format = dateFormats_1[_i];
        var match = expiresStr.match(format.regex);
        if (match) {
            var iosDateStr = format.handler(match);
            var date_1 = new Date(iosDateStr);
            if (!isNaN(date_1.getTime()))
                return date_1;
        }
    }
    // Fallback to native Date parsing (will work for ISO formats)
    var date = new Date(expiresStr);
    return isNaN(date.getTime()) ? undefined : date;
}
function parseString(setCookieValue, options) {
    if (options === void 0) { options = {}; }
    var parts = setCookieValue.split(';').filter(isNonEmptyString);
    var nameValuePairStr = parts.shift();
    var parsed = parseNameValuePair(nameValuePairStr);
    var name = parsed.name, value = parsed.value;
    options = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, defaultParseOptions), options);
    try {
        value = options.decodeValues ? decodeURIComponent(value) : value;
    }
    catch (e) {
        console.error("set-cookie-parser encountered an error while decoding a cookie with value '".concat(value, "'. Set options.decodeValues to false to disable this feature."), e);
    }
    var cookie = { name: name, value: value };
    parts.forEach(function (part) {
        var sides = part.split('=');
        var key = sides.shift().trim().toLowerCase();
        var value = sides.join('=');
        switch (key) {
            case 'expires':
                {
                    var expires = safeDateParseForIOS(value);
                    if (expires)
                        cookie.expires = expires;
                }
                break;
            case 'max-age':
                cookie.maxAge = parseInt(value, 10);
                break;
            case 'domain':
                cookie.domain = value;
                break;
            case 'path':
                cookie.path = value;
                break;
            case 'secure':
                cookie.secure = true;
                break;
            case 'httponly':
                cookie.httpOnly = true;
                break;
            case 'samesite':
                cookie.sameSite = value;
                break;
            case 'partitioned':
                cookie.partitioned = true;
                break;
            default:
                cookie[key] = value;
        }
    });
    return cookie;
}
function parse(input, options) {
    if (options === void 0) { options = {}; }
    options = (0, tslib_1.__assign)((0, tslib_1.__assign)({}, defaultParseOptions), options);
    if (!input) {
        return options.map ? {} : [];
    }
    var cookiesArray = [];
    if (typeof input === 'object' && 'headers' in input) {
        if (typeof input.headers.getSetCookie === 'function') {
            cookiesArray = input.headers.getSetCookie();
        }
        else if (input.headers['set-cookie']) {
            cookiesArray = Array.isArray(input.headers['set-cookie']) ? input.headers['set-cookie'] : [input.headers['set-cookie']];
        }
        else {
            var setCookieHeader = Object.keys(input.headers).find(function (key) { return key.toLowerCase() === 'set-cookie'; });
            var sch = setCookieHeader ? input.headers[setCookieHeader] : undefined;
            if (!sch && input.headers.cookie && !options.silent) {
                console.warn('Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.');
            }
            cookiesArray = sch ? (Array.isArray(sch) ? sch : [sch]) : [];
        }
    }
    else {
        cookiesArray = Array.isArray(input) ? input : [input];
    }
    var validCookies = cookiesArray.filter(isNonEmptyString);
    if (options.map) {
        return validCookies.reduce(function (cookies, str) {
            var cookie = parseString(str, options);
            cookies[cookie.name] = cookie;
            return cookies;
        }, {});
    }
    return validCookies.map(function (str) { return parseString(str, options); });
}
function splitCookiesString(cookiesString) {
    if (Array.isArray(cookiesString)) {
        return cookiesString;
    }
    if (typeof cookiesString !== 'string') {
        return [];
    }
    // 现在我们知道 cookiesString 是 string 类型
    var str = cookiesString;
    var cookiesStrings = [];
    var pos = 0;
    var start;
    var ch;
    var lastComma;
    var nextStart;
    var cookiesSeparatorFound;
    function skipWhitespace() {
        while (pos < str.length && /\s/.test(str.charAt(pos))) {
            pos += 1;
        }
        return pos < str.length;
    }
    function notSpecialChar() {
        ch = str.charAt(pos);
        return ch !== '=' && ch !== ';' && ch !== ',';
    }
    while (pos < str.length) {
        start = pos;
        cookiesSeparatorFound = false;
        while (skipWhitespace()) {
            ch = str.charAt(pos);
            if (ch === ',') {
                lastComma = pos;
                pos += 1;
                skipWhitespace();
                nextStart = pos;
                while (pos < str.length && notSpecialChar()) {
                    pos += 1;
                }
                if (pos < str.length && str.charAt(pos) === '=') {
                    cookiesSeparatorFound = true;
                    pos = nextStart;
                    cookiesStrings.push(str.substring(start, lastComma));
                    start = pos;
                }
                else {
                    pos = lastComma + 1;
                }
            }
            else {
                pos += 1;
            }
        }
        if (!cookiesSeparatorFound || pos >= str.length) {
            cookiesStrings.push(str.substring(start, str.length));
        }
    }
    return cookiesStrings;
}
exports.default = { parse: parse, parseString: parseString, splitCookiesString: splitCookiesString, safeDateParseForIOS: safeDateParseForIOS };
//# sourceMappingURL=set-cookie-parser.js.map