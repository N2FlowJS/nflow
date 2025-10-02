import { normalizeKey } from '../utils/normalizeKey';

describe('normalizeKey', () => {
  const cases: Array<{ input: string; expected: string }> = [
    { input: 'http-request', expected: 'httprequest' },
    { input: 'HTTP Request', expected: 'httprequest' },
    { input: 'File_Analysis', expected: 'fileanalysis' },
    { input: '  LeadingTrailing  ', expected: 'leadingtrailing' },
    { input: 'MiXeD123', expected: 'mixed123' },
    { input: '', expected: '' },
  ];

  cases.forEach(({ input, expected }) => {
    test(`normalizes "${input}"`, () => {
      expect(normalizeKey(input)).toBe(expected);
    });
  });

  it('is safe to call with falsy values once coerced to string', () => {
    expect(normalizeKey(String(null))).toBe('null');
    expect(normalizeKey(String(undefined))).toBe('undefined');
  });
});
