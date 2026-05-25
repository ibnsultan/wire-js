import Wire from '@wireblob/wire';

const CHANNEL_NAME = 'my-channel';
const EVENT_NAME = 'new-message';

// Never expose your secret in browser/client code.
const wire = new Wire({
	appId:  'YOUR_APP_ID',
	key:    'YOUR_APP_KEY',
	secret: 'YOUR_APP_SECRET',
	host:   'eu-central-1.wireblob.com',
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

// Trigger on a single channel
try {
	await wire.trigger(CHANNEL_NAME, EVENT_NAME, { message: 'Hello from server (ESM)' });
	log(`🚀 Triggered "${EVENT_NAME}" on "${CHANNEL_NAME}"`);
} catch (err) {
	log('❌ Trigger error', err.message);
}

// Trigger on multiple channels at once
try {
	await wire.trigger([CHANNEL_NAME, 'another-channel'], EVENT_NAME, { message: 'Broadcast (ESM)' });
	log(`🚀 Triggered "${EVENT_NAME}" on multiple channels`);
} catch (err) {
	log('❌ Trigger error', err.message);
}
