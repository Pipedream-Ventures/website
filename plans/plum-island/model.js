(function (root) {
  'use strict';
  const defaults = Object.freeze({ available: 25000, monthlySavings: 1000, price: 600000, down: 25, rate: 6.5, years: 30, closing: 18000, improvements: 20000, reserve: 25000, family: 4, peakRate: 4000, peakOcc: 90, shoulderRate: 2200, shoulderOcc: 55, offRate: 1400, offOcc: 25, management: 18, platform: 3, tax: 8000, insurance: 8000, utilities: 6000, maintenance: 5000, misc: 2000, capex: 4000 });
  function payment(principal, rate, years) {
    if (!principal) return 0;
    const n = years * 12, r = rate / 1200;
    return r ? principal * r / (1 - Math.pow(1 + r, -n)) : principal / n;
  }
  function balance(principal, rate, years, elapsedYears) {
    const months = Math.min(years, elapsedYears) * 12;
    const p = payment(principal, rate, years), r = rate / 1200;
    return Math.max(0, r ? principal * Math.pow(1 + r, months) - p * (Math.pow(1 + r, months) - 1) / r : principal - p * months);
  }
  function calculate(s) {
    const downCash = s.price * s.down / 100, loan = s.price - downCash;
    const upfront = downCash + s.closing + s.improvements + s.reserve;
    const monthly = payment(loan, s.rate, s.years);
    const peak = (12 - s.family) * s.peakOcc / 100 * s.peakRate;
    const shoulder = 20 * s.shoulderOcc / 100 * s.shoulderRate;
    const off = 20 * s.offOcc / 100 * s.offRate;
    const gross = peak + shoulder + off;
    const feeRate = (s.management + s.platform) / 100;
    const fees = gross * feeRate;
    const fixed = s.tax + s.insurance + s.utilities + s.maintenance + s.misc;
    const debt = monthly * 12, cash = gross - fees - fixed - debt - s.capex;
    const breakEven = (fixed + debt + s.capex) / (1 - feeRate);
    const familyCost = s.peakOcc / 100 * s.peakRate * (1 - feeRate);
    const balance5 = balance(loan, s.rate, s.years, 5);
    const sellerMonthly = payment(loan, 6, 30), sellerBalance = balance(loan, 6, 30, 5);
    return { downCash, loan, upfront, monthly, peak, shoulder, off, gross, feeRate, fees, fixed, debt, cash, breakEven, familyCost, balance5, principal5: loan - balance5, sellerMonthly, sellerBalance };
  }
  const api = { defaults, payment, balance, calculate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PlumModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
