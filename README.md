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

### Browser / Bundlers

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

### CDN Usage

The CDN file is a self-contained browser bundle. You do not need to load `pusher-js` separately.

```html
<script src="https://cdn.wireblob.com/wire/latest/wire.min.js"></script>

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

| Parameter | Type     | Required | Description            |
| --------- | -------- | -------- | ---------------------- |
| `appKey`  | `string` | Yes      | Application public key |
| `options` | `object` | No       | Connection options     |


## Configuration Options

| Option              | Type      | Default         | Description                     |
| ------------------- | --------- | --------------- | ------------------------------- |
| `host`              | `string`  | `eu-central-1.wireblob.com` | Wireblob server hostname |
| `secure`            | `boolean` | `true`          | Use secure websocket connection |
| `wsPort`            | `number`  | `80`            | WebSocket port                  |
| `wssPort`           | `number`  | `443`           | Secure WebSocket port           |
| `enabledTransports` | `array`   | `['ws', 'wss']` | Allowed transports              |
| `authEndpoint`      | `string`  | `null`          | Private/presence auth endpoint  |
| `auth`              | `object`  | `{}`            | Additional auth configuration   |


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

Client-triggered events require private or presence channels.

```js
channel.trigger('client-message', {
  text: 'Hello world'
});
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

### Server Auth Endpoint (Laravel example)

```php
Route::post('/broadcasting/auth', function () {
    return Broadcast::auth(request());
});
```

## Presence Channels

```js
const channel = wire.subscribe('presence-room');

channel.bind('pusher:subscription_succeeded', (members) => {
  console.log(members);
});
```


## Node.js Usage

Install websocket support:

```bash
npm install ws
```

```js
import Wire from '@wireblob/wire';
import WebSocket from 'ws';

global.WebSocket = WebSocket;

const wire = new Wire('YOUR_APP_KEY', {
  host: 'eu-central-1.wireblob.com',
  secure: true
});
```

## React Native

Wire works in React Native environments supporting WebSocket.

```js
import Wire from '@wireblob/wire';
```

## Web Workers

```js
import Wire from '@wireblob/wire/worker';

const wire = new Wire('YOUR_APP_KEY', {
  host: 'eu-central-1.wireblob.com'
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