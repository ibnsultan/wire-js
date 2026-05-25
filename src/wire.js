import PusherLib from 'pusher-js';

// pusher-js is CommonJS. Depending on the module system (CJS require, Babel
// ESM interop, native ESM) the constructor can land in different positions:
//   - module.exports = class Pusher {}         → PusherLib is the class
//   - module.exports = { default: Pusher }     → PusherLib.default
//   - module.exports = { Pusher: class }       → PusherLib.Pusher
// After Babel's _interopRequireDefault the value sits at PusherLib.default,
// so we unwrap one more level when needed.
const Pusher = (() => {
  if (typeof PusherLib === 'function') return PusherLib;
  const unwrapped = PusherLib?.default ?? PusherLib;
  if (typeof unwrapped === 'function') return unwrapped;
  return unwrapped?.default ?? unwrapped?.Pusher ?? unwrapped;
})();

const DEFAULT_HOST = 'eu-central-1.wireblob.com';

class Wire {
  /**
   * Client mode  — WebSocket connection:
   *   new Wire('APP_KEY', { host, secure, ... })
   *
   * Server mode — HTTP trigger API (Node.js only, never expose secret in browsers):
   *   new Wire({ appId, key, secret, host, secure })
   */
  constructor(appKeyOrConfig, options = {}) {
    
    // Server mode
    if (typeof appKeyOrConfig === 'object' && appKeyOrConfig !== null) {
      const cfg = appKeyOrConfig;

      if (!cfg.appId || !cfg.key || !cfg.secret) {
        throw new TypeError(
          'Wire server mode requires appId, key, and secret.'
        );
      }

      this._mode   = 'server';
      this._appId  = cfg.appId;
      this._key    = cfg.key;
      this._secret = cfg.secret;
      this._host   = cfg.host   ?? DEFAULT_HOST;
      this._secure = cfg.secure ?? true;
      return;
    }

    // Client mode
    const appKey = appKeyOrConfig;

    if (!appKey || typeof appKey !== 'string') {
      throw new TypeError('Wire requires a valid appKey string.');
    }

    this._mode = 'client';

    const secure = options.secure ?? true;
    const host   = options.host   ?? DEFAULT_HOST;

    const pusherOptions = {
      wsHost: host,
      forceTLS: secure,
      wsPort: options.wsPort ?? 80,
      wssPort: options.wssPort ?? 443,
      enabledTransports: options.enabledTransports ?? ['ws', 'wss'],
      cluster: ''
    };

    if (options.authEndpoint) pusherOptions.authEndpoint = options.authEndpoint;
    if (options.auth)         pusherOptions.auth         = options.auth;

    this.pusher     = new Pusher(appKey, pusherOptions);
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
  async trigger(channel, event, data = {}) {
    if (this._mode === 'server') {
      return this._httpTrigger(channel, event, data);
    }

    // Client-side trigger via existing WebSocket channel object
    const ch = this.pusher.channel(channel);
    if (!ch) {
      throw new Error(
        `Wire: not subscribed to "${channel}". Call wire.subscribe() first.`
      );
    }
    return ch.trigger(event, data);
  }

  // HTTP trigger internals (server mode)

  async _httpTrigger(channel, event, data) {
    // Pusher REST API: POST /apps/{app_id}/events
    // https://pusher.com/docs/channels/library_auth_reference/rest-api/
    const channels = Array.isArray(channel) ? channel : [channel];

    const bodyObj = {
      name:     event,
      data:     JSON.stringify(data),
      channels: channels
    };

    const body      = JSON.stringify(bodyObj);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path      = `/apps/${this._appId}/events`;
    const bodyMd5   = await this._md5(body);

    // Build sorted query string for signing (no auth_signature yet)
    const params = new URLSearchParams({
      auth_key:       this._key,
      auth_timestamp: timestamp,
      auth_version:   '1.0',
      body_md5:       bodyMd5
    });
    params.sort();

    const signature = await this._hmacSha256(
      this._secret,
      `POST\n${path}\n${params.toString()}`
    );
    params.set('auth_signature', signature);

    const scheme = this._secure ? 'https' : 'http';
    const url    = `${scheme}://${this._host}${path}?${params.toString()}`;

    const response = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`Wire trigger failed [${response.status}]: ${text}`);
    }

    return response.json().catch(() => ({}));
  }

  async _md5(text) {
    try {
      const { createHash } = await import('crypto');
      return createHash('md5').update(text).digest('hex');
    } catch {
      throw new Error(
        'Wire server-side triggers require Node.js (built-in crypto module).'
      );
    }
  }

  async _hmacSha256(secret, data) {
    try {
      const { createHmac } = await import('crypto');
      return createHmac('sha256', secret).update(data).digest('hex');
    } catch {
      throw new Error(
        'Wire server-side triggers require Node.js (built-in crypto module).'
      );
    }
  }

  // Helpers

  _requireMode(expected, methodName) {
    if (this._mode !== expected) {
      throw new Error(
        `Wire.${methodName}() is only available in ${expected} mode.`
      );
    }
  }

  // Statics

  static get logToConsole() {
    return Pusher.logToConsole;
  }

  static set logToConsole(value) {
    Pusher.logToConsole = Boolean(value);
  }
}

export default Wire;
