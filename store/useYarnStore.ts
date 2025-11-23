import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { Yarn, YarnInput } from '@/types/yarn';
import { resolveStateStorage } from '@/lib/storage';

type YarnState = {
  yarns: Yarn[];
  addYarn: (input: YarnInput) => Yarn;
  updateYarn: (id: string, data: Partial<Yarn>) => void;
  deleteYarn: (id: string) => void;
  reserveYarn: (id: string, skeins: number) => void;
  releaseYarn: (id: string, skeins: number) => void;
  getYarnById: (id: string) => Yarn | undefined;
};

const generateId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const now = () => new Date().toISOString();

const createYarn = (input: YarnInput): Yarn => {
  const timestamp = now();
  return {
    id: generateId('yarn'),
    name: input.name.trim(),
    brand: input.brand?.trim(),
    color: input.color.trim(),
    colorHex: input.colorHex,
    weightCategory: input.weightCategory,
    metersPerSkein: input.metersPerSkein,
    yardagePerSkein: input.yardagePerSkein,
    skeinsOwned: input.skeinsOwned,
    skeinsReserved: 0,
    pricePerSkein: input.pricePerSkein,
    purchasedFrom: input.purchasedFrom?.trim(),
    notes: input.notes?.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const storageResolver = () => resolveStateStorage();

export const useYarnStore = create<YarnState>()(
  persist(
    (set, get) => ({
      yarns: [],
      
      addYarn: (input) => {
        const yarn = createYarn(input);
        set((state) => ({
          yarns: [yarn, ...state.yarns],
        }));
        return yarn;
      },
      
      updateYarn: (id, data) => {
        set((state) => ({
          yarns: state.yarns.map((yarn) =>
            yarn.id === id
              ? {
                  ...yarn,
                  ...data,
                  skeinsReserved: Math.max(
                    0,
                    Math.min(
                      data.skeinsOwned ?? yarn.skeinsOwned,
                      data.skeinsReserved ?? yarn.skeinsReserved,
                    ),
                  ),
                  updatedAt: now(),
                }
              : yarn,
          ),
        }));
      },
      
      deleteYarn: (id) => {
        set((state) => ({
          yarns: state.yarns.filter((yarn) => yarn.id !== id),
        }));
      },
      
      reserveYarn: (id, skeins) => {
        set((state) => ({
          yarns: state.yarns.map((yarn) =>
            yarn.id === id
              ? {
                  ...yarn,
                  skeinsReserved: Math.min(
                    yarn.skeinsOwned,
                    yarn.skeinsReserved + skeins,
                  ),
                  updatedAt: now(),
                }
              : yarn,
          ),
        }));
      },
      
      releaseYarn: (id, skeins) => {
        set((state) => ({
          yarns: state.yarns.map((yarn) =>
            yarn.id === id
              ? {
                  ...yarn,
                  skeinsReserved: Math.max(0, yarn.skeinsReserved - skeins),
                  updatedAt: now(),
                }
              : yarn,
          ),
        }));
      },
      
      getYarnById: (id) => {
        return get().yarns.find((yarn) => yarn.id === id);
      },
    }),
    {
      name: 'knotiq-yarn-stash',
      storage: createJSONStorage(storageResolver),
      version: 1,
    },
  ),
);



