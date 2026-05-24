"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _pusherJs = _interopRequireDefault(require("pusher-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DEFAULT_HOST = 'eu-central-1.wireblob.com';
class Wire {
  constructor(appKey, options = {}) {
    if (!appKey || typeof appKey !== 'string') {
      throw new TypeError('Wire requires a valid appKey string.');
    }
    const secure = options.secure ?? true;
    const host = options.host ?? DEFAULT_HOST;
    const pusherOptions = {
      wsHost: host,
      forceTLS: secure,
      wsPort: options.wsPort ?? 80,
      wssPort: options.wssPort ?? 443,
      enabledTransports: options.enabledTransports ?? ['ws', 'wss'],
      cluster: ''
    };
    if (options.authEndpoint) {
      pusherOptions.authEndpoint = options.authEndpoint;
    }
    if (options.auth) {
      pusherOptions.auth = options.auth;
    }
    this.pusher = new _pusherJs.default(appKey, pusherOptions);
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
    return _pusherJs.default.logToConsole;
  }
  static set logToConsole(value) {
    _pusherJs.default.logToConsole = Boolean(value);
  }
}
var _default = exports.default = Wire;