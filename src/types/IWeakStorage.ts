export interface IWeakStorage<TKey extends object, TValue> {
  getOrStore: (key: TKey, getValue: () => TValue) => TValue | undefined;
  isStored: (key: TKey) => boolean;
  getStored: (key: TKey) => TValue | undefined;
  store: (key: TKey, value: TValue) => void;
  removeStored: (key: TKey) => void;
}
