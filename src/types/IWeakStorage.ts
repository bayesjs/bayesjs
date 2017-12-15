export interface IWeakStorage<TKey extends object, TValue> {
  getOrStore: (key: TKey, getValue: () => TValue) => TValue,
  isStored: (key: TKey) => boolean,
  getStored: (key: TKey) => TValue,
  store: (key: TKey, value: TValue) => void,
  removeStored: (key: TKey) => void,
}