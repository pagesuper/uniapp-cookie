declare const qq: any;
declare const tt: any;
declare const swan: any;
declare const wx: any;
declare const my: any;

function getApi() {
  if (typeof my !== 'undefined') {
    my.platform = 'my';
    return my;
  } else if (typeof tt !== 'undefined') {
    tt.platform = 'tt';
    return tt;
  } else if (typeof swan !== 'undefined') {
    swan.platform = 'swan';
    return swan;
  } else if (typeof qq !== 'undefined') {
    qq.platform = 'qq';
    return qq;
  } else if (typeof wx !== 'undefined') {
    wx.platform = typeof window !== 'undefined' && typeof location !== 'undefined' ? 'h5' : 'wx';
    return wx;
  }
  return { platform: 'none' };
}

export default getApi();
