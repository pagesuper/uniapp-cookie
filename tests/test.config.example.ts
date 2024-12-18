import testAccessToken from './test.access-token';

const testConfig = {
  weapp: {
    appid: 'xxx',
    secret: 'xxx',
    access_token: 'xxx',
  },
  offiaccount: {
    appid: 'xxx',
    secret: 'xxx',
    access_token: 'xxx',
  },
};

testConfig.weapp.access_token = testAccessToken[testConfig.weapp.appid];
testConfig.offiaccount.access_token = testAccessToken[testConfig.offiaccount.appid];

export default testConfig;
