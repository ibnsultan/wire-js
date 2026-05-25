# Wireblobs JavaScript SDK (Wire JS)

A lightweight realtime SDK for connecting to the Wireblob realtime network using a Pusher-compatible protocol.

Wire is built as a wrapper around `pusher-js`, providing:

- simpler configuration
- Wireblob-first defaults
- browser support
- Node.js support
- React Native compatibility
- Web Worker compatibility
- future extensibility without breaking API compatibility

## Installation

### NPM

```bash
npm install @wireblob/wire
```

### Yarn

```bash
yarn add @wireblob/wire
```

### PNPM

```bash
pnpm add @wireblob/wire
```

## Quick Start

### ESM

```js
import Wire from '@wireblob/wire';

const wire = new Wire('YOUR_APP_KEY', {
  host: 'eu-central-1.wireblob.com',
  secure: true
});

const channel = wire.subscribe('chat');

channel.bind('message', (data) => {
  console.log(data);
});
```

### CommonJS

```js
const WireModule = require('@wireblob/wire');
const Wire = WireModule.default || WireModule;

const wire = new Wire('YOUR_APP_KEY', {
  host: 'eu-central-1.wireblob.com',
  secure: true
});

const channel = wire.subscribe('chat');

channel.bind('message', (data) => {
  console.log(data);
});
```

### CDN Usage

The CDN file is a self-contained browser bundle.

```html
<script src="https://cdn.jsdelivr.net/npm/@wireblob/wire/lib/umd/wire.min.js"></script>

<script>
  const wire = new Wire('YOUR_APP_KEY', {
    host: 'eu-central-1.wireblob.com',
    secure: true
  });

  const channel = wire.subscribe('chat');

  channel.bind('message', (data) => {
    console.log(data);
  });
</script>
```

## Constructor

```js
new Wire(appKey, options)
```

### Parameters

| Parameter   | Type       | Required | Description            |
| ----------- | ---------- | -------- | ---------------------- |
| `appKey`  | `string` | Yes      | Application public key |
| `options` | `object` | No       | Connection options     |

## Configuration Options

| Option                | Type        | Default                       | Description                     |
| --------------------- | ----------- | ----------------------------- | ------------------------------- |
| `host`              | `string`  | `eu-central-1.wireblob.com` | Wireblob server hostname        |
| `secure`            | `boolean` | `true`                      | Use secure websocket connection |
| `wsPort`            | `number`  | `80`                        | WebSocket port                  |
| `wssPort`           | `number`  | `443`                       | Secure WebSocket port           |
| `enabledTransports` | `array`   | `['ws', 'wss']`             | Allowed transports              |
| `authEndpoint`      | `string`  | `null`                      | Private/presence auth endpoint  |
| `auth`              | `object`  | `{}`                        | Additional auth configuration   |

## Subscribing to Channels

```js
const channel = wire.subscribe('chat-room');
```

## Listening for Events

```js
channel.bind('message', (data) => {
  console.log(data);
});
```

## Triggering Events

### Client-side trigger

Sends a real-time event over the existing WebSocket connection. Requires a `private-` or `presence-` channel and the event name must start with `client-`.

```js
const channel = wire.subscribe('private-chat');

channel.trigger('client-message', { text: 'Hello world' });
```

### Server-side trigger (Node.js)

Sends an event via the Wireblob HTTP REST API. Requires `appId`, `key`, and `secret`. **Never expose your secret in browser code.**

```js

import Wire from '@wireblob/wire';

// use this instead of import if using with commonJs
// const WireModule = require('@wireblob/wire');
// const Wire = WireModule.default || WireModule;

const wire = new Wire({
  appId:  'YOUR_APP_ID',
  key:    'YOUR_APP_KEY',
  secret: 'YOUR_APP_SECRET',
  host:   'eu-central-1.wireblob.com',
  secure: true
});

// Single channel
await wire.trigger('chat', 'message', { text: 'Hello from server' });

// Multiple channels
await wire.trigger(['chat', 'notifications'], 'message', { text: 'Broadcast' });
```

## Unsubscribing

```js
wire.unsubscribe('chat-room');
```

## Connection Events

### Connected

```js
wire.connection.bind('connected', () => {
  console.log('Connected');
});
```

### Error

```js
wire.connection.bind('error', (error) => {
  console.error(error);
});
```

### Disconnected

```js
wire.connection.bind('disconnected', () => {
  console.log('Disconnected');
});
```

### Manual Connect / Disconnect

```js
wire.connect();
wire.disconnect();
```

## Private Channels

```js
const channel = wire.subscribe('private-chat');
```

## Presence Channels

```js
const channel = wire.subscribe('presence-room');

channel.bind('pusher:subscription_succeeded', (members) => {
  console.log(members);
});
```

## Advanced Configuration

```js
const wire = new Wire('YOUR_APP_KEY', {
  host: 'eu-central-1.wireblob.com',
  secure: true,
  wsPort: 80,
  wssPort: 443,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: '/broadcasting/auth',
  auth: {
    headers: {
      Authorization: 'Bearer TOKEN'
    }
  }
});
```

## Debugging

Enable internal Pusher logging:

```js
Wire.logToConsole = true;
```

## Architecture

Wire is:

- protocol-compatible with Pusher Channels
- transport-compatible with standard WebSocket infrastructure
- designed for Wireblob-native extensions

Current implementation:

- wraps `pusher-js`
- applies Wireblob defaults
- exposes a stable SDK surface

Future versions may introduce:

- native Wire transport
- SSE support
- QUIC/WebTransport
- MQTT adapters
- custom protocol optimizations

## Compatibility

| Platform     | Supported |
| ------------ | --------- |
| Browser      | Yes       |
| Node.js      | Yes       |
| React Native | Yes       |
| Web Workers  | Yes       |

## Credits

- [Pusher](https://pusher.com) - Protocol and transport compatibility
