/* eslint-disable no-console */

const amqp = require('amqplib');
const { randomUUID } = require('node:crypto');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE = process.env.SMOKE_ALERT_EXCHANGE || 'notifinance.events';
const ALERT_TIMEOUT_MS = Number(process.env.ALERT_SMOKE_TIMEOUT_MS || 45000);

async function callEndpoint(method, path, options = {}) {
  const { token, body } = options;
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body != null) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  return {
    status: response.status,
    payload,
  };
}

async function getDemoToken() {
  const response = await callEndpoint('POST', '/api/v1/auth/demo', { body: {} });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Unable to get demo token: status=${response.status}`);
  }

  if (!response.payload || typeof response.payload.accessToken !== 'string') {
    throw new Error('Demo auth payload does not contain accessToken');
  }

  return response.payload.accessToken;
}

async function getAsset(token, ticker) {
  const response = await callEndpoint('GET', `/api/v1/assets/${ticker}`, { token });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Unable to load asset ${ticker}: status=${response.status}`);
  }

  if (!response.payload || typeof response.payload.id !== 'string') {
    throw new Error(`Asset ${ticker} payload does not include id`);
  }

  return response.payload;
}

async function createPriceAlert(token, assetId) {
  const response = await callEndpoint('POST', '/api/v1/alerts', {
    token,
    body: {
      assetId,
      alertType: 'PRICE',
      condition: 'ABOVE',
      threshold: 1,
      channels: ['IN_APP'],
      isRecurring: true,
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Unable to create alert: status=${response.status}`);
  }

  if (!response.payload || typeof response.payload.id !== 'string') {
    throw new Error('Alert creation payload does not include id');
  }

  return response.payload;
}

async function publishMarketQuoteEvent(assetId, ticker, correlationId) {
  const connection = await amqp.connect(RABBITMQ_URL);

  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

    const message = {
      payload: {
        eventId: randomUUID(),
        eventType: 'market.quote.updated',
        recipientId: 'system-market',
        metadata: {
          assetId,
          ticker,
          closePrice: 999999,
          changePct: 5.25,
        },
      },
      options: {
        headers: {
          'x-correlation-id': correlationId,
        },
      },
    };

    const published = channel.publish(
      EXCHANGE,
      'market.quote.updated',
      Buffer.from(JSON.stringify(message)),
      {
        contentType: 'application/json',
        headers: {
          'x-correlation-id': correlationId,
        },
      },
    );

    if (!published) {
      throw new Error('RabbitMQ publish returned false');
    }

    await channel.close();
  } finally {
    await connection.close();
  }
}

async function waitForNotification(token, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await callEndpoint(
      'GET',
      '/api/v1/notifications?unreadOnly=true&page=1&limit=20',
      { token },
    );

    if (response.status >= 200 && response.status < 300) {
      const notifications = Array.isArray(response.payload?.data)
        ? response.payload.data
        : [];

      if (notifications.length > 0) {
        return notifications[0];
      }
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  }

  throw new Error(`No notification received within ${timeoutMs}ms`);
}

async function main() {
  const correlationId = `smoke-alert-${Date.now()}`;

  console.log(`SMOKE_BASE_URL=${BASE_URL}`);
  console.log(`RABBITMQ_URL=${RABBITMQ_URL}`);
  console.log(`CORRELATION_ID=${correlationId}`);

  const token = await getDemoToken();
  const asset = await getAsset(token, 'GGAL');
  const alert = await createPriceAlert(token, asset.id);

  console.log(`ALERT_ID=${alert.id}`);
  console.log(`ASSET_ID=${asset.id}`);

  await publishMarketQuoteEvent(asset.id, 'GGAL', correlationId);
  const notification = await waitForNotification(token, ALERT_TIMEOUT_MS);

  console.log(`NOTIFICATION_ID=${notification.id}`);
  console.log('ALERT_FLOW_SMOKE=PASS');
}

main().catch((error) => {
  console.error('ALERT_FLOW_SMOKE=FAIL');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
