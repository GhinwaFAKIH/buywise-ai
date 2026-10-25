export const comparisonRows=[
{product:"The Ordinary Niacinamide 10% + Zinc 1%",sizeMl:30,examplePriceEur:7.95,ingredient:"Niacinamide 10%, Zinc PCA",source:"https://theordinary.com/",status:"Illustrative price; not live or verified"},
{product:"Example niacinamide serum B (hypothetical)",sizeMl:50,examplePriceEur:14,ingredient:"Ingredient list unspecified",source:null,status:"Hypothetical comparison, not a purchasable product"},
{product:"Example niacinamide serum C (hypothetical)",sizeMl:60,examplePriceEur:12,ingredient:"Ingredient list unspecified",source:null,status:"Hypothetical comparison, not a purchasable product"}
];
export const perTenMl=(p)=>Number((p.examplePriceEur/p.sizeMl*10).toFixed(2));
