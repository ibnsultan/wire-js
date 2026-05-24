"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _pusherJs = _interopRequireDefault(require("pusher-js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// pusher-js is CommonJS. Depending on the module system (CJS require, Babel
// ESM interop, native ESM) the constructor can land in different positions:
//   - module.exports = class Pusher {}         → PusherLib is the class
//   - module.exports = { default: Pusher }     → PusherLib.default
//   - module.exports = { Pusher: class }       → PusherLib.Pusher
// After Babel's _interopRequireDefault the value sits at PusherLib.default,
// so we unwrap one more level when needed.
const Pusher = (() => {
  if (typeof _pusherJs.default === 'function') return _pusherJs.default;
  const unwrapped = (_pusherJs.default === null || _pusherJs.default === void 0 ? void 0 : _pusherJs.default.default) ?? _pusherJs.default;
  if (typeof unwrapped === 'function') return unwrapped;
  return (unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.default) ?? (unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.Pusher) ?? unwrapped;
})();
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
var _default = exports.default = Wire;