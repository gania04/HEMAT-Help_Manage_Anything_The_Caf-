import { 
  calculateTotalMaterialCost, 
  calculateOverheadCost, 
  calculateTotalHPP, 
  calculateRecommendedSellingPrice,
  calculateHppSummary
} from '../hpp-calculator';

describe('HPP Calculator', () => {
  const mockIngredients = [
    { quantity: 2, pricePerUnit: 5000 }, // 10000
    { quantity: 1, pricePerUnit: 2000 }, // 2000
  ];

  it('should calculate total material cost correctly', () => {
    const total = calculateTotalMaterialCost(mockIngredients);
    expect(total).toBe(12000);
  });

  it('should calculate overhead cost correctly (10% by default)', () => {
    const totalMaterialCost = 12000;
    const overhead = calculateOverheadCost(totalMaterialCost);
    expect(overhead).toBe(1200);
  });

  it('should calculate total HPP correctly', () => {
    const totalMaterialCost = 12000;
    const overhead = 1200;
    const totalHpp = calculateTotalHPP(totalMaterialCost, overhead);
    expect(totalHpp).toBe(13200);
  });

  it('should calculate recommended selling price correctly (150% markup by default)', () => {
    const totalHpp = 10000;
    const sellingPrice = calculateRecommendedSellingPrice(totalHpp);
    expect(sellingPrice).toBe(25000);
  });

  it('should return correct summary object', () => {
    const summary = calculateHppSummary(mockIngredients);
    expect(summary).toEqual({
      totalMaterialCost: 12000,
      overheadCost: 1200,
      totalHPP: 13200,
      hppPerUnit: 13200,
      recommendedSellingPrice: 33000
    });
  });
});
