import { Project } from '@/types/project';
import { Yarn } from '@/types/yarn';

export type YarnStats = {
  totalSkeins: number;
  totalValue: number;
  totalMeters: number;
  mostUsedBrand: string;
  mostUsedWeight: string;
  lowStockCount: number;
};

export type StockAlert = {
  yarnId: string;
  name: string;
  color: string;
  available: number;
  status: 'out_of_stock' | 'low_stock' | 'fully_reserved';
};

/**
 * Calculate aggregate statistics for yarn stash
 */
export function calculateYarnStats(yarns: Yarn[]): YarnStats {
  const totalSkeins = yarns.reduce((sum, y) => sum + y.skeinsOwned, 0);
  
  const totalValue = yarns.reduce((sum, y) => {
    const price = y.pricePerSkein || 0;
    return sum + (price * y.skeinsOwned);
  }, 0);

  const totalMeters = yarns.reduce((sum, y) => {
    const meters = y.metersPerSkein || 0;
    return sum + (meters * y.skeinsOwned);
  }, 0);

  // Most used brand
  const brands: Record<string, number> = {};
  yarns.forEach(y => {
    if (y.brand) brands[y.brand] = (brands[y.brand] || 0) + 1;
  });
  const mostUsedBrand = Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Most used weight
  const weights: Record<string, number> = {};
  yarns.forEach(y => {
    weights[y.weightCategory] = (weights[y.weightCategory] || 0) + 1;
  });
  const mostUsedWeight = Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Low stock count (less than 1 skein available)
  const lowStockCount = yarns.filter(y => (y.skeinsOwned - y.skeinsReserved) < 1).length;

  return {
    totalSkeins,
    totalValue: Math.round(totalValue * 100) / 100,
    totalMeters: Math.round(totalMeters),
    mostUsedBrand,
    mostUsedWeight,
    lowStockCount,
  };
}

/**
 * Identify yarns that need attention
 */
export function getStockAlerts(yarns: Yarn[]): StockAlert[] {
  const alerts: StockAlert[] = [];

  yarns.forEach(yarn => {
    const available = yarn.skeinsOwned - yarn.skeinsReserved;

    if (yarn.skeinsOwned === 0) {
      alerts.push({
        yarnId: yarn.id,
        name: yarn.name,
        color: yarn.color,
        available,
        status: 'out_of_stock'
      });
    } else if (available < 0) {
      // Should not happen with correct logic, but treated as fully reserved/oversold
      alerts.push({
        yarnId: yarn.id,
        name: yarn.name,
        color: yarn.color,
        available,
        status: 'fully_reserved'
      });
    } else if (available === 0 && yarn.skeinsOwned > 0) {
      alerts.push({
        yarnId: yarn.id,
        name: yarn.name,
        color: yarn.color,
        available,
        status: 'fully_reserved'
      });
    } else if (available < 1) {
      alerts.push({
        yarnId: yarn.id,
        name: yarn.name,
        color: yarn.color,
        available,
        status: 'low_stock'
      });
    }
  });

  return alerts.sort((a, b) => {
    const severity = { out_of_stock: 3, fully_reserved: 2, low_stock: 1 };
    return severity[b.status] - severity[a.status];
  });
}










