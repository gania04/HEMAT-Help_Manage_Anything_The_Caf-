export type IngredientCost = {
  quantity: number;
  pricePerUnit: number;
};

export function calculateTotalMaterialCost(ingredients: IngredientCost[]): number {
  return ingredients.reduce((total, ing) => total + (ing.quantity * ing.pricePerUnit), 0);
}

export function calculateOverheadCost(totalMaterialCost: number, overheadPercentage: number = 0.1): number {
  return totalMaterialCost * overheadPercentage;
}

export function calculateTotalHPP(totalMaterialCost: number, overheadCost: number): number {
  return totalMaterialCost + overheadCost;
}

export function calculateRecommendedSellingPrice(totalHPP: number, targetMargin: number = 0.6): number {
  if (targetMargin >= 1) targetMargin = 0.99; // Prevent division by zero or negative prices
  return totalHPP / (1 - targetMargin);
}

export function calculateHppSummary(ingredients: IngredientCost[], targetMargin: number = 0.6, overheadPercentage: number = 0.1) {
  const totalMaterialCost = calculateTotalMaterialCost(ingredients);
  const overheadCost = calculateOverheadCost(totalMaterialCost, overheadPercentage);
  const totalHPP = calculateTotalHPP(totalMaterialCost, overheadCost);
  const recommendedSellingPrice = calculateRecommendedSellingPrice(totalHPP, targetMargin);

  return {
    totalMaterialCost,
    overheadCost,
    totalHPP,
    recommendedSellingPrice
  };
}
