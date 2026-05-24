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

export default Wire;
