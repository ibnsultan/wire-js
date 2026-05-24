import Pusher from 'pusher-js';

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
