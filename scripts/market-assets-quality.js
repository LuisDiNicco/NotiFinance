/* eslint-disable no-console */

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
const MAX_DEVIATION_PCT = Number(process.env.ASSET_QUALITY_MAX_DEVIATION_PCT || 10);
const SAMPLE_LIMIT = Number(process.env.ASSET_QUALITY_SAMPLE_LIMIT || 12);

const TYPE_TO_ENDPOINT = {
  STOCK: 'https://data912.com/live/arg_stocks',
  CEDEAR: 'https://data912.com/live/arg_cedears',
  BOND: 'https://data912.com/live/arg_bonds',
  ON: 'https://data912.com/live/arg_corp',
};

const TYPES = ['STOCK', 'CEDEAR', 'BOND', 'ON'];

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} -> HTTP ${response.status}`);
  }

  return response.json();
}

function toNumber(value) {
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

function resolveReferencePrice(row) {
  const close = toNumber(row?.c);
  const bid = toNumber(row?.px_bid);
  const ask = toNumber(row?.px_ask);

  if (close > 0) {
    return close;
  }

  if (bid > 0 && ask > 0) {
    return (bid + ask) / 2;
  }

  return bid > 0 ? bid : ask;
}

async function getBackendAssets(type) {
  const payload = await fetchJson(
    `${BASE_URL}/api/v1/assets?type=${type}&page=1&limit=${SAMPLE_LIMIT}`,
  );

  return Array.isArray(payload?.data) ? payload.data : [];
}

async function getBackendLatestPrice(ticker) {
  const stats = await fetchJson(
    `${BASE_URL}/api/v1/assets/${encodeURIComponent(ticker)}/stats?days=30`,
  );

  return toNumber(stats?.latestClose);
}

async function main() {
  const failures = [];
  const checks = [];

  for (const type of TYPES) {
    const referenceRows = await fetchJson(TYPE_TO_ENDPOINT[type]);
    const referenceMap = new Map(
      (Array.isArray(referenceRows) ? referenceRows : [])
        .filter((row) => typeof row?.symbol === 'string')
        .map((row) => [String(row.symbol).toUpperCase(), row]),
    );

    const backendAssets = await getBackendAssets(type);
    const sampledAssets = backendAssets.slice(0, SAMPLE_LIMIT);

    for (const asset of sampledAssets) {
      const ticker = String(asset?.ticker || '').toUpperCase();
      if (!ticker) {
        continue;
      }

      const referenceRow = referenceMap.get(ticker);
      if (!referenceRow) {
        checks.push(`${type} ${ticker}: no reference row in Data912`);
        continue;
      }

      const [backendPrice, referencePrice] = await Promise.all([
        getBackendLatestPrice(ticker),
        Promise.resolve(resolveReferencePrice(referenceRow)),
      ]);

      if (backendPrice <= 0 || referencePrice <= 0) {
        checks.push(
          `${type} ${ticker}: skipped non-positive values backend=${backendPrice} ref=${referencePrice}`,
        );
        continue;
      }

      const deviationPct =
        (Math.abs(backendPrice - referencePrice) / referencePrice) * 100;

      checks.push(
        `${type} ${ticker}: backend=${backendPrice.toFixed(2)} ref=${referencePrice.toFixed(2)} dev=${deviationPct.toFixed(2)}%`,
      );

      if (deviationPct > MAX_DEVIATION_PCT) {
        failures.push(
          `${type} ${ticker}: deviation ${deviationPct.toFixed(2)}% > ${MAX_DEVIATION_PCT}%`,
        );
      }
    }
  }

  console.log(`ASSET_QUALITY_BASE_URL=${BASE_URL}`);
  console.log(`ASSET_QUALITY_MAX_DEVIATION_PCT=${MAX_DEVIATION_PCT}`);
  console.log(`ASSET_QUALITY_SAMPLE_LIMIT=${SAMPLE_LIMIT}`);
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

  console.log('ASSET_QUALITY_STATUS=OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});