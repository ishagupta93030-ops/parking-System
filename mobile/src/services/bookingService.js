import { VEHICLE_TYPES } from '../data/facilitiesData';

/**
 * Calculate detailed pricing breakdown
 */
export function calculateParkingCost(facilityRate = 30.0, vehicleTypeId = 'car', hours = 1) {
  const vehicle = VEHICLE_TYPES.find(v => v.id === vehicleTypeId) || VEHICLE_TYPES[0];
  const ratePerHour = facilityRate * vehicle.baseMultiplier;
  const baseFare = ratePerHour * hours;
  const tax = baseFare * 0.05; // 5% GST
  const totalAmount = baseFare + tax;

  return {
    ratePerHour: Number(ratePerHour.toFixed(2)),
    baseFare: Number(baseFare.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    vehicleLabel: vehicle.label,
    vehicleIcon: vehicle.icon
  };
}

/**
 * Generate a unique digital pass ticket ID
 */
export function generateTicketId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `#PS-MOB-${randomSuffix}`;
}

/**
 * Find the nearest free slot across floors
 */
export function findNearestVacantSlot(floors) {
  for (const floor of floors) {
    const freeSlot = floor.slots.find(s => s.status === 'VACANT');
    if (freeSlot) {
      return { floor, slot: freeSlot };
    }
  }
  return null;
}

/**
 * Format remaining time in MM:SS or HH:MM:SS
 */
export function formatRemainingTime(seconds) {
  if (seconds <= 0) return '00:00:00 (Expired)';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
