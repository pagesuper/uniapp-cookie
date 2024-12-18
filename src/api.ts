declare const uni: any;
declare const qq: any;
declare const tt: any;
declare const swan: any;
declare const wx: any;
declare const my: any;

function getApi() {
  if (typeof my !== 'undefined') {
    uni.platform = 'my';
    return uni;
  } else if (typeof tt !== 'undefined') {
    uni.platform = 'tt';
    return uni;
  } else if (typeof swan !== 'undefined') {
    uni.platform = 'swan';
    return uni;
  } else if (typeof qq !== 'undefined') {
    uni.platform = 'qq';
    return uni;
  } else if (typeof wx !== 'undefined') {
    uni.platform = typeof window !== 'undefined' && typeof location !== 'undefined' ? 'h5' : 'wx';
    return uni;
  }
  return { platform: 'none' };
}

export default getApi();
