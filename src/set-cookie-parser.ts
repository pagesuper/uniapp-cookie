'use strict';

interface ParseOptions {
  decodeValues?: boolean;
  map?: boolean;
  silent?: boolean;
}

interface Cookie {
  name: string;
  value: string;
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  partitioned?: boolean;
  [key: string]: any;
}

interface NameValuePair {
  name: string;
  value: string;
}

const defaultParseOptions: ParseOptions = {
  decodeValues: true,
  map: false,
  silent: false,
};

function isNonEmptyString(str: any): str is string {
  return typeof str === 'string' && !!str.trim();
}

function parseNameValuePair(nameValuePairStr: string): NameValuePair {
  const nameValueArr = nameValuePairStr.split('=');
  if (nameValueArr.length > 1) {
    const name = nameValueArr.shift()!;
    const value = nameValueArr.join('=');
    return { name, value };
  }
  return { name: '', value: nameValuePairStr };
}

function safeDateParseForIOS(expiresStr: string): Date | undefined {
  if (!expiresStr) return undefined;

  // Common cookie date formats and their iOS-compatible conversions
  const dateFormats = [
    // RFC 1123 (Thu, 01 Jan 1970 00:00:00 GMT)
    {
      regex: /^[A-Za-z]{3}, (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
      handler: (match: RegExpMatchArray) => `${match[3]}/${match[2]}/${match[1]} ${match[4]}`,
    },
    // RFC 850 (Thursday, 01-Jan-70 00:00:00 GMT)
    {
      regex: /^[A-Za-z]{3,9}, (\d{2})-([A-Za-z]{3})-(\d{2,4}) (\d{2}:\d{2}:\d{2}) GMT$/,
      handler: (match: RegExpMatchArray) => {
        const year = match[3].length === 2 ? `19${match[3]}` : match[3];
        return `${year}/${match[2]}/${match[1]} ${match[4]}`;
      },
    },
    // ANSI C's asctime() format (Thu Jan  1 00:00:00 1970)
    {
      regex: /^[A-Za-z]{3} ([A-Za-z]{3}) (\d{1,2}) (\d{2}:\d{2}:\d{2}) (\d{4})$/,
      handler: (match: RegExpMatchArray) => `${match[4]}/${match[1]}/${match[2].padStart(2, '0')} ${match[3]}`,
    },
    // Simple format (01 Jan 1970 00:00:00 GMT)
    {
      regex: /^(\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}:\d{2}:\d{2}) GMT$/,
      handler: (match: RegExpMatchArray) => `${match[3]}/${match[2]}/${match[1]} ${match[4]}`,
    },
  ];

  // Try known formats first
  for (const format of dateFormats) {
    const match = expiresStr.match(format.regex);
    if (match) {
      const iosDateStr = format.handler(match);
      const date = new Date(iosDateStr);
      if (!isNaN(date.getTime())) return date;
    }
  }

  // Fallback to native Date parsing (will work for ISO formats)
  const date = new Date(expiresStr);
  return isNaN(date.getTime()) ? undefined : date;
}

function parseString(setCookieValue: string, options: ParseOptions = {}): Cookie {
  const parts = setCookieValue.split(';').filter(isNonEmptyString);
  const nameValuePairStr = parts.shift()!;
  const parsed = parseNameValuePair(nameValuePairStr);
  let { name, value } = parsed;

  options = { ...defaultParseOptions, ...options };

  try {
    value = options.decodeValues ? decodeURIComponent(value) : value;
  } catch (e) {
    console.error(
      `set-cookie-parser encountered an error while decoding a cookie with value '${value}'. Set options.decodeValues to false to disable this feature.`,
      e,
    );
  }

  const cookie: Cookie = { name, value };

  parts.forEach((part) => {
    const sides = part.split('=');
    const key = sides.shift()!.trim().toLowerCase();
    const value = sides.join('=');

    switch (key) {
      case 'expires':
        {
          const expires = safeDateParseForIOS(value);
          if (expires) cookie.expires = expires;
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

function parse(
  input: string | string[] | { headers: any } | null | undefined,
  options: ParseOptions = {},
): Cookie[] | Record<string, Cookie> {
  options = { ...defaultParseOptions, ...options };

  if (!input) {
    return options.map ? {} : [];
  }

  let cookiesArray: string[] = [];

  if (typeof input === 'object' && 'headers' in input) {
    if (typeof input.headers.getSetCookie === 'function') {
      cookiesArray = input.headers.getSetCookie();
    } else if (input.headers['set-cookie']) {
      cookiesArray = Array.isArray(input.headers['set-cookie']) ? input.headers['set-cookie'] : [input.headers['set-cookie']];
    } else {
      const setCookieHeader = Object.keys(input.headers).find((key) => key.toLowerCase() === 'set-cookie');
      const sch = setCookieHeader ? input.headers[setCookieHeader] : undefined;

      if (!sch && input.headers.cookie && !options.silent) {
        console.warn(
          'Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.',
        );
      }
      cookiesArray = sch ? (Array.isArray(sch) ? sch : [sch]) : [];
    }
  } else {
    cookiesArray = Array.isArray(input) ? input : [input];
  }

  const validCookies = cookiesArray.filter(isNonEmptyString);

  if (options.map) {
    return validCookies.reduce<Record<string, Cookie>>((cookies, str) => {
      const cookie = parseString(str, options);
      cookies[cookie.name] = cookie;
      return cookies;
    }, {});
  }

  return validCookies.map((str) => parseString(str, options));
}

function splitCookiesString(cookiesString: string | string[]): string[] {
  if (Array.isArray(cookiesString)) {
    return cookiesString;
  }
  if (typeof cookiesString !== 'string') {
    return [];
  }

  // 现在我们知道 cookiesString 是 string 类型
  const str = cookiesString;
  const cookiesStrings: string[] = [];
  let pos = 0;
  let start: number;
  let ch: string;
  let lastComma: number;
  let nextStart: number;
  let cookiesSeparatorFound: boolean;

  function skipWhitespace(): boolean {
    while (pos < str.length && /\s/.test(str.charAt(pos))) {
      pos += 1;
    }
    return pos < str.length;
  }

  function notSpecialChar(): boolean {
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
        } else {
          pos = lastComma + 1;
        }
      } else {
        pos += 1;
      }
    }

    if (!cookiesSeparatorFound || pos >= str.length) {
      cookiesStrings.push(str.substring(start, str.length));
    }
  }

  return cookiesStrings;
}

export default { parse, parseString, splitCookiesString, safeDateParseForIOS };

export type { Cookie, ParseOptions };
