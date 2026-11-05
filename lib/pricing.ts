// Simple mock distance estimate — later replaced by Google Maps Distance Matrix
export function estimateDistanceKm(pickupCity: string, destCity: string): number {
  if (!pickupCity || !destCity) return 50;
  const seed = (pickupCity.length + destCity.length) * 17;
  return 50 + (seed % 400); // 50–450 km
}

export interface PriceBreakdown {
  distanceKm: number;
  basePrice: number;
  distanceFee: number;
  weightFee: number;
  bagFee: number;
  total: number;
}

export function calculatePrice({
  pickupCity,
  destinationCity,
  totalWeight,
  totalBags,
}: {
  pickupCity: string;
  destinationCity: string;
  totalWeight: number;
  totalBags: number;
}): PriceBreakdown {
  const distanceKm = estimateDistanceKm(pickupCity, destinationCity);

  // NGN Rates
  const basePrice = 2500;           // Flat base
  const perKmRate = 150;            // ₦150 per km
  const perKgRate = 300;            // ₦300 per kg
  const perBagRate = 1000;          // ₦1,000 per bag

  const distanceFee = Math.round(distanceKm * perKmRate);
  const weightFee = Math.round(totalWeight * perKgRate);
  const bagFee = Math.round(totalBags * perBagRate);
  const total = basePrice + distanceFee + weightFee + bagFee;

  return {
    distanceKm,
    basePrice,
    distanceFee,
    weightFee,
    bagFee,
    total,
  };
}

// Utility to format NGN nicely: ₦12,500
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}