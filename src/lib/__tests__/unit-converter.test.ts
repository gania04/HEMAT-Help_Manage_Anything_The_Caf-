import { convertUnit } from '../unit-converter';

describe('Unit Converter', () => {
  it('should convert Kg to Gram correctly', () => {
    const result = convertUnit(1.5, 'Kg', 'Gram');
    expect(result).toBe(1500);
  });

  it('should convert Gram to Kg correctly', () => {
    const result = convertUnit(500, 'Gram', 'Kg');
    expect(result).toBe(0.5);
  });

  it('should convert Liter to ml correctly', () => {
    const result = convertUnit(2, 'Liter', 'ml');
    expect(result).toBe(2000);
  });

  it('should convert ml to Liter correctly', () => {
    const result = convertUnit(250, 'ml', 'Liter');
    expect(result).toBe(0.25);
  });

  it('should convert Dus to Pcs correctly', () => {
    const result = convertUnit(2, 'Dus', 'Pcs');
    expect(result).toBe(48); // 2 * 24
  });

  it('should return the same quantity if units are the same', () => {
    const result = convertUnit(100, 'Gram', 'Gram');
    expect(result).toBe(100);
  });

  it('should throw an error for incompatible units', () => {
    expect(() => convertUnit(1, 'Kg', 'Liter')).toThrow('Tidak dapat mengonversi Kg ke Liter');
  });
});
