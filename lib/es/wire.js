import Pusher from 'pusher-js';
const DEFAULT_HOST = 'eu-central-1.wireblob.com';
class Wire {
  constructor(appKey) {
    var _options$secure, _options$host, _options$wsPort, _options$wssPort, _options$enabledTrans;
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!appKey || typeof appKey !== 'string') {
      throw new TypeError('Wire requires a valid appKey string.');
    }
    const secure = (_options$secure = options.secure) !== null && _options$secure !== void 0 ? _options$secure : true;
    const host = (_options$host = options.host) !== null && _options$host !== void 0 ? _options$host : DEFAULT_HOST;
    const pusherOptions = {
      wsHost: host,
      forceTLS: secure,
      wsPort: (_options$wsPort = options.wsPort) !== null && _options$wsPort !== void 0 ? _options$wsPort : 80,
      wssPort: (_options$wssPort = options.wssPort) !== null && _options$wssPort !== void 0 ? _options$wssPort : 443,
      enabledTransports: (_options$enabledTrans = options.enabledTransports) !== null && _options$enabledTrans !== void 0 ? _options$enabledTrans : ['ws', 'wss'],
      cluster: ''
    };
    if (options.authEndpoint) {
      pusherOptions.authEndpoint = options.authEndpoint;
    }
    if (options.auth) {
      pusherOptions.auth = options.auth;
    }
    this.pusher = new Pusher(appKey, pusherOptions);
    this.connection = this.pusher.connection;
  }
  subscribe(channelName) {
    return this.pusher.subscribe(channelName);
  }
  unsubscribe(channelName) {
    this.pusher.unsubscribe(channelName);
  }
  connect() {
    this.pusher.connect();
  }
  disconnect() {
    this.pusher.disconnect();
  }
  static get logToConsole() {
    return Pusher.logToConsole;
  }
  static set logToConsole(value) {
    Pusher.logToConsole = Boolean(value);
  }
}
export default Wire;