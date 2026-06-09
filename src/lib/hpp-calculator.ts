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

export function calculateRecommendedSellingPrice(totalHPP: number, markupMultiplier: number = 2.5): number {
  return totalHPP * markupMultiplier;
}

export function calculateHppSummary(ingredients: IngredientCost[]) {
  const totalMaterialCost = calculateTotalMaterialCost(ingredients);
  const overheadCost = calculateOverheadCost(totalMaterialCost);
  const totalHPP = calculateTotalHPP(totalMaterialCost, overheadCost);
  const recommendedSellingPrice = calculateRecommendedSellingPrice(totalHPP);

  return {
    totalMaterialCost,
    overheadCost,
    totalHPP,
    recommendedSellingPrice
  };
}
