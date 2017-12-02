import { IStorage, IWeakStorage } from '../types/index';

const getOrStoreMaker = <TKey, TValue>(isStore, getStored, setValue) => (key: TKey, getValue: () => TValue) => {
  if (isStore(key)) return getStored(key)
  
  const value = getValue();
  setValue(key, value)
  return value;
}

const isStoredMaker = <TKey>(storage) => (key: TKey) => {
  return storage.has(key);
}

const storeMaker = <TKey, TValue>(storage) => (key: TKey, value: TValue) => {
  storage.set(key, value);
}

const getStoredMaker = <TKey>(storage) => (key: TKey) => {
  return storage.get(key);
}

const removeStoredMaker = <TKey>(storage) => (key: TKey) => {
  storage.delete(key);
}

const cleanMaker = <TKey>(storage) => () => {
  storage.clear();
}

const createDefaultStorage = <TKey, TValue>(storage: Map<TKey, TValue> | WeakMap<object, TValue>) => {
  const isStored = isStoredMaker(storage);
  const getStored = getStoredMaker(storage);
  const store = storeMaker(storage);
  const removeStored = removeStoredMaker(storage);
  const getOrStore = getOrStoreMaker(isStored, getStored, store);

  return {
    getOrStore,
    isStored,
    getStored,
    store,
    removeStored,
  };
};

export const createWeakStorage = <TKey extends object, TValue>(storage?: WeakMap<TKey, TValue>): IWeakStorage<TKey, TValue> => {
  return createDefaultStorage(storage || new WeakMap());
};

export const createStorage = <TKey, TValue>(storage?: Map<TKey, TValue>): IStorage<TKey, TValue> => {
  const store = storage || new Map();
  const clear = cleanMaker(store);
  
  return {
    ...createDefaultStorage(store),
    clear,
  };
};

