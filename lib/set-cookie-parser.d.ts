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
declare function safeDateParseForIOS(expiresStr: string): Date | undefined;
declare function parseString(setCookieValue: string, options?: ParseOptions): Cookie;
declare function parse(input: string | string[] | {
    headers: any;
} | null | undefined, options?: ParseOptions): Cookie[] | Record<string, Cookie>;
declare function splitCookiesString(cookiesString: string | string[]): string[];
declare const _default: {
    parse: typeof parse;
    parseString: typeof parseString;
    splitCookiesString: typeof splitCookiesString;
    safeDateParseForIOS: typeof safeDateParseForIOS;
};
export default _default;
export type { Cookie, ParseOptions };
