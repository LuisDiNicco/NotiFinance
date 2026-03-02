/* eslint-disable no-console */

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const MAX_DEVIATION_PCT = Number(process.env.DOLLAR_QUALITY_MAX_DEVIATION_PCT || 10);

const SOURCE_PRIORITY = ['dolarapi.com', 'criptoya.com', 'bluelytics.com'];

const TYPES = ['OFICIAL', 'BLUE', 'MEP', 'CCL', 'TARJETA', 'CRIPTO'];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status}`);
  }
  return response.json();
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

function parseNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.includes(',')
      ? value.replace(/\./g, '').replace(',', '.').trim()
      : value.trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function toReferenceMap(dolarApi, bluelytics, criptoya) {
  const byType = new Map();

  for (const item of dolarApi) {
    const casa = String(item.casa || '').toLowerCase();
    let type = null;
    if (casa === 'oficial') type = 'OFICIAL';
    if (casa === 'blue') type = 'BLUE';
    if (casa === 'bolsa') type = 'MEP';
    if (casa === 'contadoconliqui') type = 'CCL';
    if (casa === 'tarjeta') type = 'TARJETA';
    if (casa === 'cripto') type = 'CRIPTO';

    if (!type) continue;
    const values = byType.get(type) || [];
    values.push({
      source: 'dolarapi.com',
      buy: parseNumber(item.compra),
      sell: parseNumber(item.venta),
    });
    byType.set(type, values);
  }

  const bluelyticsPairs = [
    ['OFICIAL', bluelytics?.oficial],
    ['BLUE', bluelytics?.blue],
  ];

  for (const [type, quote] of bluelyticsPairs) {
    if (!quote) continue;
    const values = byType.get(type) || [];
    values.push({
      source: 'bluelytics.com',
      buy: Number(quote.value_buy || 0),
      sell: Number(quote.value_sell || 0),
    });
    byType.set(type, values);
  }

  const mep = criptoya?.mep?.al30?.ci || criptoya?.mep?.gd30?.ci;
  const ccl = criptoya?.ccl?.al30?.ci || criptoya?.ccl?.gd30?.ci;
  const criptoPairs = [
    ['OFICIAL', criptoya?.oficial?.bid, criptoya?.oficial?.ask],
    ['BLUE', criptoya?.blue?.bid, criptoya?.blue?.ask],
    ['TARJETA', criptoya?.tarjeta?.price, criptoya?.tarjeta?.price],
    ['CRIPTO', criptoya?.cripto?.usdt?.bid, criptoya?.cripto?.usdt?.ask],
    ['MEP', mep?.price, mep?.price],
    ['CCL', ccl?.price, ccl?.price],
  ];

  for (const [type, buy, sell] of criptoPairs) {
    const parsedBuy = Number(buy || 0);
    const parsedSell = Number(sell || 0);
    if (!Number.isFinite(parsedBuy) || !Number.isFinite(parsedSell) || parsedBuy <= 0 || parsedSell <= 0) {
      continue;
    }

    const values = byType.get(type) || [];
    values.push({ source: 'criptoya.com', buy: parsedBuy, sell: parsedSell });
    byType.set(type, values);
  }

  return byType;
}

function buildSourceDetails(references) {
  return [...references]
    .sort(
      (left, right) =>
        SOURCE_PRIORITY.indexOf(left.source) - SOURCE_PRIORITY.indexOf(right.source),
    )
    .map((item) => `${item.source}(buy=${item.buy.toFixed(2)},sell=${item.sell.toFixed(2)})`)
    .join(', ');
}

async function main() {
  const [appDollar, dolarApi, bluelytics, criptoya] = await Promise.all([
    fetchJson(`${BASE_URL}/api/v1/market/dollar`),
    fetchJson('https://dolarapi.com/v1/dolares'),
    fetchJson('https://api.bluelytics.com.ar/v2/latest'),
    fetchJson('https://criptoya.com/api/dolar'),
  ]);

  const appData = Array.isArray(appDollar?.data) ? appDollar.data : [];
  const appMap = new Map(appData.map((quote) => [String(quote.type), quote]));
  const referenceMap = toReferenceMap(dolarApi, bluelytics, criptoya);

  const failures = [];
  const checks = [];

  for (const type of TYPES) {
    const appQuote = appMap.get(type);
    if (!appQuote) {
      failures.push(`${type}: missing in backend response`);
      continue;
    }

    const refs = referenceMap.get(type) || [];
    if (refs.length < 2) {
      failures.push(`${type}: insufficient external references (${refs.length})`);
      continue;
    }

    const buyMedian = median(refs.map((item) => item.buy));
    const sellMedian = median(refs.map((item) => item.sell));
    const appBuy = Number(appQuote.buyPrice || 0);
    const appSell = Number(appQuote.sellPrice || 0);

    const buyDeviationPct = buyMedian > 0 ? (Math.abs(appBuy - buyMedian) / buyMedian) * 100 : 0;
    const sellDeviationPct = sellMedian > 0 ? (Math.abs(appSell - sellMedian) / sellMedian) * 100 : 0;

    checks.push(
      `${type}: devBuy=${buyDeviationPct.toFixed(2)}% devSell=${sellDeviationPct.toFixed(2)}% refs=${buildSourceDetails(refs)}`,
    );

    if (buyDeviationPct > MAX_DEVIATION_PCT || sellDeviationPct > MAX_DEVIATION_PCT) {
      failures.push(
        `${type}: deviation too high (buy=${buyDeviationPct.toFixed(2)}%, sell=${sellDeviationPct.toFixed(2)}%, limit=${MAX_DEVIATION_PCT}%)`,
      );
    }
  }

  console.log(`QUALITY_BASE_URL=${BASE_URL}`);
  console.log(`MAX_DEVIATION_PCT=${MAX_DEVIATION_PCT}`);
  for (const check of checks) {
    console.log(`CHECK ${check}`);
  }

  if (failures.length > 0) {
    console.log(`FAILURES=${failures.length}`);
    for (const failure of failures) {
      console.log(`FAIL ${failure}`);
    }
    process.exit(1);
  }

  console.log('QUALITY_STATUS=OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});