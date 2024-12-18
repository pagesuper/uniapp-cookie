import api from './api';
import CookieStore from './cookie-store';

interface ICookieRequestProxyOptions {
  url: string;
  method?: string;
  data?: any;
  header?: { [key: string]: string };
  headers?: { [key: string]: string };
  dataType?: string;
  responseType?: string;
  success?: (res: any) => void;
  fail?: (err: any) => void;
  complete?: () => void;
  cookie?: boolean;
}

/**
 * 微信 Cookie 代理
 */
const cookieStore = (function () {
  // 创建 cookieStore 实例
  const cookieStore = new CookieStore();

  /**
   * 定义请求 cookie 代理函数
   * @param  {Object} options 请求参数
   */
  function cookieRequestProxy(options: ICookieRequestProxyOptions) {
    // 是否启用 cookie（默认 true）
    options.cookie = options.cookie === undefined || !!options.cookie;
    // 数据类型
    options.dataType = options.dataType || 'json';
    options.header = options.headers = options.header || options.headers || {};
    options.header['X-Requested-With'] = 'XMLHttpRequest';
    if (options.dataType === 'json') {
      options.header.Accept = 'application/json, text/plain, */*';
    }

    // 判断在小程序环境是否启用 cookie
    if (api.platform !== 'h5' && options.cookie) {
      // 域名
      const domain = (options.url || '').split('/')[2];
      const path = options.url.split(domain).pop();

      // 获取请求 cookies
      const requestCookies = cookieStore.getRequestCookies(domain, path);

      // 请求时带上设置的 cookies
      options.header.Cookie = requestCookies;

      // 请求成功回调
      const successCallback = options.success;
      options.success = function (response) {
        response.header = response.header || response.headers;
        // 获取响应 cookies
        let responseCookies = response.header ? response.header['Set-Cookie'] || response.header['set-cookie'] : '';
        if (responseCookies) {
          // 处理QQ小程序下cookie分隔符问题：https://github.com/charleslo1/weapp-cookie/issues/39
          // eslint-disable-next-line no-useless-escape
          responseCookies = responseCookies.replace(/\;([^\s\;]*?(?=\=))/gi, ',$1');
          // 设置 cookies，以便下次请求带上
          cookieStore.setResponseCookies(responseCookies, domain);
        }
        // 调用成功回调函数
        successCallback && successCallback(response);
      };
    }

    // 发送网络请求
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    /* @ts-expect-error */
    return (this as any)(options);
  }

  // 绑定新的
  const requestProxy = cookieRequestProxy.bind(api.request);
  const uploadFileProxy = cookieRequestProxy.bind(api.uploadFile);
  const downloadFileProxy = cookieRequestProxy.bind(api.downloadFile);

  try {
    // 增加 requestWithCookie、uploadFileWithCookie、downloadFileWithCookie 接口
    Object.defineProperties(api, {
      // request
      requestWithCookie: {
        value: requestProxy,
      },
      // uploadFile
      uploadFileWithCookie: {
        value: uploadFileProxy,
      },
      // downloadFile
      downloadFileWithCookie: {
        value: downloadFileProxy,
      },
    });

    // 使用 requestProxy 覆盖微信原生 request、uploadFile、downloadFile 接口
    Object.defineProperties(api, {
      // request
      request: {
        value: requestProxy,
      },
      // uploadFile
      uploadFile: {
        value: uploadFileProxy,
      },
      // downloadFile
      downloadFile: {
        value: downloadFileProxy,
      },
    });
  } catch (err) {
    console.error('weapp-cookie: ', err);
  }

  // 配置
  cookieStore.config = function (options: {
    requestAlias: PropertyKey;
    uploadFileAlias: PropertyKey;
    downloadFileAlias: PropertyKey;
  }) {
    options = Object.assign(
      {
        requestAlias: 'requestWithCookie',
        uploadFileAlias: 'uploadFileWithCookie',
        downloadFileAlias: 'downloadFileWithCookie',
      },
      options,
    );
    // 配置请求别名
    if (options.requestAlias) {
      Object.defineProperty(api, options.requestAlias, { value: requestProxy });
    }
    if (options.uploadFileAlias) {
      Object.defineProperty(api, options.uploadFileAlias, { value: uploadFileProxy });
    }
    if (options.downloadFileAlias) {
      Object.defineProperty(api, options.downloadFileAlias, { value: downloadFileProxy });
    }
  };

  // 返回 cookieStore
  return cookieStore;
})();

// 导出 cookieStore 实例
export default cookieStore;
