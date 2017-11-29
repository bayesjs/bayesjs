import { isNil } from 'lodash';

const getOrStoreMaker = <TKey, TValue>(storage) => (key: TKey, getValue: () => TValue) => {
  const cached = storage.get(key);
  if (!isNil(cached)) return cached;

  const result = getValue();
  storage.set(key, result);
  return result;
}

const isStoredMaker = <TKey>(storage) => (key: TKey) => {
  const cached = storage.get(key);
  
  return !isNil(cached);
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

const createDefaultStorage = <TKey, TValue>(storage: Map<TKey, TValue> | WeakMap<object, TValue>) => {
  const weak = new WeakMap();
  const map = new Map();
  const getOrStore = getOrStoreMaker(storage);
  const isStored = isStoredMaker(storage);
  const getStored = getStoredMaker(storage);
  const store = storeMaker(storage);
  const removeStored = removeStoredMaker(storage);

  return {
    getOrStore,
    isStored,
    getStored,
    store,
    removeStored,
  };
};

export const createWeakStorage = <TKey extends object, TValue>(storage?: WeakMap<TKey, TValue>) => {
  return createDefaultStorage(storage || new WeakMap());
};

export const createStorage = <TKey, TValue>(storage?: Map<TKey, TValue>) => {
  return createDefaultStorage(storage || new Map());
};

