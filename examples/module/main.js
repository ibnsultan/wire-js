import Wire from '@wireblob/wire';

const CHANNEL_NAME = 'my-channel';
const EVENT_NAME = 'new-message';

const wire = new Wire('YOUR_APPLICATION_KEY', {
	host: 'eu-central-1.wireblob.com',
	secure: true
});

function now() {
	return new Date().toISOString();
}

function log(label, payload) {
	if (payload === undefined) {
		console.log(`[${now()}] ${label}`);
		return;
	}

	try {
		const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
		console.log(`[${now()}] ${label}: ${serialized}`);
	} catch {
		console.log(`[${now()}] ${label}:`, payload);
	}
}

wire.connection.bind('connecting', () => {
	log('Connecting');
});

wire.connection.bind('connected', () => {
	log('✅ Connected');
});

wire.connection.bind('state_change', (states) => {
	log('Connection state change', states);
});

wire.connection.bind('disconnected', () => {
	log('⚠️ Disconnected');
});

wire.connection.bind('error', (err) => {
	log('❌ Connection error', err);
});

const channel = wire.subscribe(CHANNEL_NAME);
log(`Subscribed to channel "${CHANNEL_NAME}"; watching event "${EVENT_NAME}"`);

channel.bind(EVENT_NAME, (data) => {
	log(`📩 ${CHANNEL_NAME}:${EVENT_NAME}`, data);
});

if (typeof channel.bind_global === 'function') {
	channel.bind_global((eventName, data) => {
		log(`📨 ${CHANNEL_NAME}:${eventName}`, data);
	});
}

process.on('SIGINT', () => {
	log('Shutting down');
	try {
		wire.disconnect();
	} finally {
		process.exit(0);
	}
});

