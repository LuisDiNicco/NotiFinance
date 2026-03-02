import {
  calculateTNATEA,
  calculateYTM,
} from '../../../../../src/modules/market-data/application/FixedIncomeCalculator';

describe('FixedIncomeCalculator', () => {
  it('returns YTM close to coupon rate for a par bond', () => {
    const valuationDate = new Date('2026-01-01T00:00:00.000Z');
    const maturityDate = new Date('2031-01-01T00:00:00.000Z');

    const ytm = calculateYTM({
      price: 100,
      couponRate: 0.08,
      faceValue: 100,
      maturityDate,
      frequency: 2,
      valuationDate,
    });

    expect(ytm).not.toBeNull();
    expect(ytm!).toBeCloseTo(0.08, 3);
  });

  it('returns higher YTM when bond price is below par', () => {
    const valuationDate = new Date('2026-01-01T00:00:00.000Z');
    const maturityDate = new Date('2031-01-01T00:00:00.000Z');

    const ytm = calculateYTM({
      price: 90,
      couponRate: 0.08,
      faceValue: 100,
      maturityDate,
      frequency: 2,
      valuationDate,
    });

    expect(ytm).not.toBeNull();
    expect(ytm!).toBeGreaterThan(0.08);
  });

  it('calculates TNA and TEA for zero coupon instruments', () => {
    const valuationDate = new Date('2026-01-01T00:00:00.000Z');
    const maturityDate = new Date('2027-01-01T00:00:00.000Z');

    const result = calculateTNATEA({
      price: 80,
      faceValue: 100,
      maturityDate,
      valuationDate,
    });

    expect(result).not.toBeNull();
    expect(result!.tna).toBeCloseTo(0.25, 4);
    expect(result!.tea).toBeCloseTo(0.25, 4);
  });
});
