function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import PusherLib from 'pusher-js';

// pusher-js is CommonJS. Depending on the module system (CJS require, Babel
// ESM interop, native ESM) the constructor can land in different positions:
//   - module.exports = class Pusher {}         → PusherLib is the class
//   - module.exports = { default: Pusher }     → PusherLib.default
//   - module.exports = { Pusher: class }       → PusherLib.Pusher
// After Babel's _interopRequireDefault the value sits at PusherLib.default,
// so we unwrap one more level when needed.
const Pusher = ((_PusherLib$default, _ref, _unwrapped$default) => {
  if (typeof PusherLib === 'function') return PusherLib;
  const unwrapped = (_PusherLib$default = PusherLib === null || PusherLib === void 0 ? void 0 : PusherLib.default) !== null && _PusherLib$default !== void 0 ? _PusherLib$default : PusherLib;
  if (typeof unwrapped === 'function') return unwrapped;
  return (_ref = (_unwrapped$default = unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.default) !== null && _unwrapped$default !== void 0 ? _unwrapped$default : unwrapped === null || unwrapped === void 0 ? void 0 : unwrapped.Pusher) !== null && _ref !== void 0 ? _ref : unwrapped;
})();
const DEFAULT_HOST = 'eu-central-1.wireblob.com';
const _defaults = {
  host: DEFAULT_HOST,
  secure: true
};
class Wire {
  /**
   * Client mode  — WebSocket connection:
   *   new Wire('APP_KEY', { host, secure, ... })
   *
   * Server mode — HTTP trigger API (Node.js only, never expose secret in browsers):
   *   new Wire({ appId, key, secret, host, secure })
   */
  constructor(appKeyOrConfig) {
    var _options$secure, _options$host, _options$wsPort, _options$wssPort, _options$enabledTrans;
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // Server mode
    if (typeof appKeyOrConfig === 'object' && appKeyOrConfig !== null) {
      var _cfg$host, _cfg$secure;
      const cfg = _objectSpread(_objectSpread({}, _defaults), appKeyOrConfig);
      if (!cfg.appId || !cfg.key || !cfg.secret) {
        throw new TypeError('Wire server mode requires appId, key, and secret.');
      }
      this._mode = 'server';
      this._appId = cfg.appId;
      this._key = cfg.key;
      this._secret = cfg.secret;
      this._host = (_cfg$host = cfg.host) !== null && _cfg$host !== void 0 ? _cfg$host : DEFAULT_HOST;
      this._secure = (_cfg$secure = cfg.secure) !== null && _cfg$secure !== void 0 ? _cfg$secure : true;
      return;
    }

    // Client mode
    const appKey = appKeyOrConfig;
    if (!appKey || typeof appKey !== 'string') {
      throw new TypeError('Wire requires a valid appKey string.');
    }
    this._mode = 'client';
    const secure = (_options$secure = options.secure) !== null && _options$secure !== void 0 ? _options$secure : _defaults.secure;
    const host = (_options$host = options.host) !== null && _options$host !== void 0 ? _options$host : _defaults.host;
    const pusherOptions = {
      wsHost: host,
      forceTLS: secure,
      wsPort: (_options$wsPort = options.wsPort) !== null && _options$wsPort !== void 0 ? _options$wsPort : 80,
      wssPort: (_options$wssPort = options.wssPort) !== null && _options$wssPort !== void 0 ? _options$wssPort : 443,
      enabledTransports: (_options$enabledTrans = options.enabledTransports) !== null && _options$enabledTrans !== void 0 ? _options$enabledTrans : ['ws', 'wss'],
      cluster: ''
    };
    if (options.authEndpoint) pusherOptions.authEndpoint = options.authEndpoint;
    if (options.auth) pusherOptions.auth = options.auth;
    this.pusher = new Pusher(appKey, pusherOptions);
    this.connection = this.pusher.connection;
  }

  // Client-only methods

  subscribe(channelName) {
    this._requireMode('client', 'subscribe');
    return this.pusher.subscribe(channelName);
  }
  unsubscribe(channelName) {
    this._requireMode('client', 'unsubscribe');
    this.pusher.unsubscribe(channelName);
  }
  connect() {
    this._requireMode('client', 'connect');
    this.pusher.connect();
  }
  disconnect() {
    this._requireMode('client', 'disconnect');
    this.pusher.disconnect();
  }

  /**
   * Client mode only — returns an already-subscribed channel object, or null.
   *
   *   const ch = wire.channel('presence-room');
   *
   * @param {string} channelName
   * @returns {object|null}
   */
  channel(channelName) {
    var _this$pusher$channel;
    this._requireMode('client', 'channel');
    return (_this$pusher$channel = this.pusher.channel(channelName)) !== null && _this$pusher$channel !== void 0 ? _this$pusher$channel : null;
  }

  /**
   * Client mode only — returns all currently subscribed channel objects.
   *
   *   const channels = wire.allChannels();
   *
   * @returns {object[]}
   */
  allChannels() {
    this._requireMode('client', 'allChannels');
    return this.pusher.allChannels();
  }

  /**
   * Client mode only — initiates user authentication (Pusher signin flow).
   * Requires userAuthentication config to be set in the constructor options.
   *
   *   wire.signin();
   */
  signin() {
    this._requireMode('client', 'signin');
    this.pusher.signin();
  }

  // Trigger — works in both modes

  /**
   * Client mode : triggers a client-event on an already-subscribed
   *               private / presence channel.
   *
   * Server mode : sends an event via the Wireblob HTTP REST API.
   *               Supports single channel (string) or multiple channels (array).
   *
   * @param {string|string[]} channel  Channel name(s)
   * @param {string}          event    Event name
   * @param {object}          data     Payload
   */
  async trigger(channel, event) {
    let data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    if (this._mode === 'server') {
      return this._httpTrigger(channel, event, data);
    }

    // Client-side trigger via existing WebSocket channel object
    const ch = this.pusher.channel(channel);
    if (!ch) {
      throw new Error("Wire: not subscribed to \"".concat(channel, "\". Call wire.subscribe() first."));
    }
    return ch.trigger(event, data);
  }

  /**
   * Server mode only — generates the auth signature for a private or presence
   * channel subscription request.
   *
   * Private channel:
   *   const auth = await wire.authorizeChannel(socketId, 'private-room');
   *   // → { auth: 'key:hmac' }
   *
   * Presence channel (pass channelData with user info):
   *   const auth = await wire.authorizeChannel(socketId, 'presence-room', {
   *     user_id: '123',
   *     user_info: { name: 'Alice' }
   *   });
   *   // → { auth: 'key:hmac', channel_data: '{"user_id":"123",...}' }
   *
   * @param {string} socketId     The socket_id sent by the client
   * @param {string} channel      The channel name
   * @param {object} [channelData] Required for presence channels
   * @returns {Promise<{auth: string, channel_data?: string}>}
   */
  async authorizeChannel(socketId, channel) {
    let channelData = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    this._requireMode('server', 'authorizeChannel');
    if (!socketId || !channel) {
      throw new TypeError('authorizeChannel requires socketId and channel.');
    }
    let stringToSign = "".concat(socketId, ":").concat(channel);
    let result = {};
    if (channelData !== null) {
      const channelDataStr = typeof channelData === 'string' ? channelData : JSON.stringify(channelData);
      stringToSign += ":".concat(channelDataStr);
      result.channel_data = channelDataStr;
    }
    const signature = await this._hmacSha256(this._secret, stringToSign);
    result.auth = "".concat(this._key, ":").concat(signature);
    return result;
  }

  /**
   * Server mode only — authenticates a user (Pusher user-authentication,
   * separate from channel auth). Used with pusher.signin() on the client.
   *
   *   const auth = await wire.authenticateUser(socketId, { id: '123', name: 'Alice' });
   *   // → { auth: 'key:hmac', user_data: '{"id":"123","name":"Alice"}' }
   *
   * @param {string} socketId  The socket_id sent by the client
   * @param {object} userData  Must contain at least { id: string }
   * @returns {Promise<{auth: string, user_data: string}>}
   */
  async authenticateUser(socketId, userData) {
    this._requireMode('server', 'authenticateUser');
    if (!socketId) throw new TypeError('authenticateUser requires socketId.');
    if (!(userData !== null && userData !== void 0 && userData.id)) throw new TypeError('authenticateUser: userData must include an id.');
    const userDataStr = typeof userData === 'string' ? userData : JSON.stringify(userData);
    const signature = await this._hmacSha256(this._secret, "".concat(socketId, "::user::").concat(userDataStr));
    return {
      auth: "".concat(this._key, ":").concat(signature),
      user_data: userDataStr
    };
  }

  /**
   * Server mode only — verifies an incoming webhook from Wireblob/Pusher.
   * Returns the parsed body if the signature is valid, throws otherwise.
   *
   *   const payload = await wire.verifyWebhook(requestHeaders, rawBody);
   *
   * @param {object} headers   Request headers (must include x-pusher-key and x-pusher-signature)
   * @param {string} rawBody   Raw request body string (do NOT parse before passing)
   * @returns {Promise<object>} Parsed webhook payload
   */
  async verifyWebhook(headers, rawBody) {
    var _headers$xPusherKey, _headers$xPusherSig;
    this._requireMode('server', 'verifyWebhook');
    const receivedKey = (_headers$xPusherKey = headers['x-pusher-key']) !== null && _headers$xPusherKey !== void 0 ? _headers$xPusherKey : headers['X-Pusher-Key'];
    const receivedSig = (_headers$xPusherSig = headers['x-pusher-signature']) !== null && _headers$xPusherSig !== void 0 ? _headers$xPusherSig : headers['X-Pusher-Signature'];
    if (!receivedKey || !receivedSig) {
      throw new Error('Wire.verifyWebhook: missing x-pusher-key or x-pusher-signature header.');
    }
    if (receivedKey !== this._key) {
      throw new Error('Wire.verifyWebhook: webhook key does not match.');
    }
    const expected = await this._hmacSha256(this._secret, rawBody);
    if (expected !== receivedSig) {
      throw new Error('Wire.verifyWebhook: invalid signature — webhook rejected.');
    }
    return JSON.parse(rawBody);
  }

  /**
   * Server mode only — queries the REST API for channel info.
   *
   *   const info = await wire.channelInfo('presence-room', ['user_count', 'subscription_count']);
   *
   * @param {string}   channel     Channel name
   * @param {string[]} [attributes] e.g. ['user_count', 'subscription_count']
   * @returns {Promise<object>}
   */
  async channelInfo(channel) {
    let attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    this._requireMode('server', 'channelInfo');
    return this._httpGet("/apps/".concat(this._appId, "/channels/").concat(encodeURIComponent(channel)), attributes.length ? {
      info: attributes.join(',')
    } : {});
  }

  /**
   * Server mode only — lists all occupied channels, optionally filtered.
   *
   *   const { channels } = await wire.channels({ filter_by_prefix: 'presence-' });
   *
   * @param {object} [params]  e.g. { filter_by_prefix, info }
   * @returns {Promise<object>}
   */
  async channels() {
    let params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this._requireMode('server', 'channels');
    return this._httpGet("/apps/".concat(this._appId, "/channels"), params);
  }

  /**
   * Server mode only — lists users in a presence channel.
   *
   *   const { users } = await wire.presenceUsers('presence-room');
   *
   * @param {string} channel  Presence channel name
   * @returns {Promise<{users: Array<{id: string}>}>}
   */
  async presenceUsers(channel) {
    this._requireMode('server', 'presenceUsers');
    return this._httpGet("/apps/".concat(this._appId, "/channels/").concat(encodeURIComponent(channel), "/users"), {});
  }

  /**
   * Server mode only — sends multiple events in a single HTTP call.
   *
   *   await wire.triggerBatch([
   *     { channel: 'ch-1', event: 'msg', data: { text: 'hi' } },
   *     { channel: 'ch-2', event: 'msg', data: { text: 'hey' } },
   *   ]);
   *
   * @param {Array<{channel: string, event: string, data?: object}>} events
   * @returns {Promise<object>}
   */
  async triggerBatch(events) {
    this._requireMode('server', 'triggerBatch');
    if (!Array.isArray(events) || events.length === 0) {
      throw new TypeError('triggerBatch requires a non-empty array of events.');
    }
    const batch = events.map(e => {
      var _e$data;
      return {
        channel: e.channel,
        name: e.event,
        data: JSON.stringify((_e$data = e.data) !== null && _e$data !== void 0 ? _e$data : {})
      };
    });
    return this._httpPost("/apps/".concat(this._appId, "/batch_events"), {
      batch
    });
  }

  /**
   * Server mode only — forcibly disconnects all connections for a user.
   *
   *   await wire.terminateUserConnections('user-123');
   *
   * @param {string} userId
   * @returns {Promise<object>}
   */
  async terminateUserConnections(userId) {
    this._requireMode('server', 'terminateUserConnections');
    if (!userId) throw new TypeError('terminateUserConnections requires a userId.');
    return this._httpDelete("/apps/".concat(this._appId, "/users/").concat(encodeURIComponent(userId)));
  }

  // HTTP GET helper (server mode)

  async _httpGet(path) {
    let queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params = new URLSearchParams(_objectSpread({
      auth_key: this._key,
      auth_timestamp: timestamp,
      auth_version: '1.0'
    }, queryParams));
    params.sort();
    const signature = await this._hmacSha256(this._secret, "GET\n".concat(path, "\n").concat(params.toString()));
    params.set('auth_signature', signature);
    const scheme = this._secure ? 'https' : 'http';
    const url = "".concat(scheme, "://").concat(this._host).concat(path, "?").concat(params.toString());
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error("Wire request failed [".concat(response.status, "]: ").concat(text));
    }
    return response.json().catch(() => ({}));
  }

  // HTTP POST helper (server mode)

  async _httpPost(path, bodyObj) {
    const body = JSON.stringify(bodyObj);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyMd5 = await this._md5(body);
    const params = new URLSearchParams({
      auth_key: this._key,
      auth_timestamp: timestamp,
      auth_version: '1.0',
      body_md5: bodyMd5
    });
    params.sort();
    const signature = await this._hmacSha256(this._secret, "POST\n".concat(path, "\n").concat(params.toString()));
    params.set('auth_signature', signature);
    const scheme = this._secure ? 'https' : 'http';
    const url = "".concat(scheme, "://").concat(this._host).concat(path, "?").concat(params.toString());
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error("Wire request failed [".concat(response.status, "]: ").concat(text));
    }
    return response.json().catch(() => ({}));
  }

  // HTTP DELETE helper (server mode)

  async _httpDelete(path) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params = new URLSearchParams({
      auth_key: this._key,
      auth_timestamp: timestamp,
      auth_version: '1.0'
    });
    params.sort();
    const signature = await this._hmacSha256(this._secret, "DELETE\n".concat(path, "\n").concat(params.toString()));
    params.set('auth_signature', signature);
    const scheme = this._secure ? 'https' : 'http';
    const url = "".concat(scheme, "://").concat(this._host).concat(path, "?").concat(params.toString());
    const response = await fetch(url, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error("Wire request failed [".concat(response.status, "]: ").concat(text));
    }
    return response.json().catch(() => ({}));
  }

  // HTTP trigger internals (server mode)

  async _httpTrigger(channel, event, data) {
    const channels = Array.isArray(channel) ? channel : [channel];
    return this._httpPost("/apps/".concat(this._appId, "/events"), {
      name: event,
      data: JSON.stringify(data),
      channels
    });
  }
  async _md5(text) {
    // Web Crypto does not support MD5; use a pure-JS implementation.
    // MD5 here is used solely for the body_md5 request-signing parameter
    // (integrity check, not security).
    return _md5Pure(text);
  }
  async _hmacSha256(secret, data) {
    var _globalThis$crypto;
    if (typeof ((_globalThis$crypto = globalThis.crypto) === null || _globalThis$crypto === void 0 ? void 0 : _globalThis$crypto.subtle) === 'undefined') {
      throw new Error('Wire: Web Crypto API is not available in this environment.');
    }
    const enc = new TextEncoder();
    const keyObj = await globalThis.crypto.subtle.importKey('raw', enc.encode(secret), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, ['sign']);
    const sig = await globalThis.crypto.subtle.sign('HMAC', keyObj, enc.encode(data));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Helpers

  _requireMode(expected, methodName) {
    if (this._mode !== expected) {
      throw new Error("Wire.".concat(methodName, "() is only available in ").concat(expected, " mode."));
    }
  }

  // Statics

  static get logToConsole() {
    return Pusher.logToConsole;
  }
  static set logToConsole(value) {
    Pusher.logToConsole = Boolean(value);
  }

  /**
   * Set global defaults applied to every new Wire instance.
   *
   *   Wire.config({ host: 'my-region.wireblob.com', secure: false });
   *
   * @param {object} options  Keys: host, secure, wsPort, wssPort, enabledTransports
   */
  static config() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (typeof options !== 'object' || options === null) {
      throw new TypeError('Wire.config() expects a plain object.');
    }
    Object.assign(_defaults, options);
  }

  /** Current SDK version. */
  static get version() {
    return '1.0.4';
  }
}

// Pure-JS MD5 — used only when neither Node.js crypto nor a native MD5 is
// available. MD5 here is used solely for the body_md5 request-signing
// parameter (integrity, not security).
function _md5Pure(str) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return (x >> 16) + (y >> 16) + (lsw >> 16) << 16 | lsw & 0xffff;
  }
  function bitRotateLeft(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  const utf8 = unescape(encodeURIComponent(str));
  const len8 = utf8.length;
  const m = [];
  for (let i = 0; i < len8; i++) m[i >> 2] |= utf8.charCodeAt(i) << i % 4 * 8;
  m[len8 >> 2] |= 0x80 << len8 % 4 * 8;
  m[(len8 + 8 >> 6 << 4) + 14] = len8 * 8;
  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;
  for (let i = 0; i < m.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d;
    a = md5ff(a, b, c, d, m[i], 7, -680876936);
    d = md5ff(d, a, b, c, m[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, m[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, m[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, m[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, m[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, m[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, m[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, m[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, m[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, m[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, m[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, m[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, m[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, m[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, m[i + 15], 22, 1236535329);
    a = md5gg(a, b, c, d, m[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, m[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, m[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, m[i], 20, -373897302);
    a = md5gg(a, b, c, d, m[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, m[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, m[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, m[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, m[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, m[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, m[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, m[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, m[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, m[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, m[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, m[i + 12], 20, -1926607734);
    a = md5hh(a, b, c, d, m[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, m[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, m[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, m[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, m[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, m[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, m[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, m[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, m[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, m[i], 11, -358537222);
    c = md5hh(c, d, a, b, m[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, m[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, m[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, m[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, m[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, m[i + 2], 23, -995338651);
    a = md5ii(a, b, c, d, m[i], 6, -198630844);
    d = md5ii(d, a, b, c, m[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, m[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, m[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, m[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, m[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, m[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, m[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, m[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, m[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, m[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, m[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, m[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, m[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, m[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, m[i + 9], 21, -343485551);
    a = safeAdd(a, oa);
    b = safeAdd(b, ob);
    c = safeAdd(c, oc);
    d = safeAdd(d, od);
  }
  return [a, b, c, d].map(n => (n < 0 ? n + 4294967296 : n).toString(16).padStart(8, '0').match(/../g).reverse().join('')).join('');
}
export default Wire;