import fc from 'fast-check';
import {
  calculateTNATEA,
  calculateYTM,
} from 'src/modules/market-data/application/FixedIncomeCalculator';

describe('FixedIncomeCalculator property-based', () => {
  it('YTM decreases when price increases for same bond parameters', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 50, max: 500, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: 0.2, noNaN: true, noDefaultInfinity: true }),
        fc.integer({ min: 1, max: 4 }),
        fc.integer({ min: 180, max: 3650 }),
        (faceValue, couponRate, frequency, daysToMaturity) => {
          const valuationDate = new Date('2026-01-01T00:00:00.000Z');
          const maturityDate = new Date(valuationDate);
          maturityDate.setUTCDate(maturityDate.getUTCDate() + daysToMaturity);

          const lowPrice = faceValue * 0.7;
          const highPrice = faceValue * 1.3;

          const ytmAtLowPrice = calculateYTM({
            price: lowPrice,
            couponRate,
            faceValue,
            maturityDate,
            frequency,
            valuationDate,
          });

          const ytmAtHighPrice = calculateYTM({
            price: highPrice,
            couponRate,
            faceValue,
            maturityDate,
            frequency,
            valuationDate,
          });

          if (ytmAtLowPrice == null || ytmAtHighPrice == null) {
            return true;
          }

          return ytmAtHighPrice < ytmAtLowPrice;
        },
      ),
      { numRuns: 200 },
    );
  });

  it('TNATEA yields finite non-negative values for discount instruments', () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 100,
          max: 10000,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.double({
          min: 0.05,
          max: 0.95,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        fc.integer({ min: 30, max: 3650 }),
        (faceValue, discountRatio, daysToMaturity) => {
          const valuationDate = new Date('2026-01-01T00:00:00.000Z');
          const maturityDate = new Date(valuationDate);
          maturityDate.setUTCDate(maturityDate.getUTCDate() + daysToMaturity);

          const result = calculateTNATEA({
            price: faceValue * discountRatio,
            faceValue,
            maturityDate,
            valuationDate,
          });

          if (!result) {
            return false;
          }

          return (
            Number.isFinite(result.tna) &&
            Number.isFinite(result.tea) &&
            result.tna >= 0 &&
            result.tea >= 0
          );
        },
      ),
      { numRuns: 200 },
    );
  });
});
