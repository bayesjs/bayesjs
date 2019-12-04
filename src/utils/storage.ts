import { IStorage, IWeakStorage } from '../types'

export const createWeakStorage = <TKey extends object, TValue>(storage?: WeakMap<TKey, TValue>): IWeakStorage<TKey, TValue> => {
  const myStorage = storage || new WeakMap()
  const isStored = (key: TKey) => myStorage.has(key)
  const getStored = (key: TKey) => myStorage.get(key)
  const store = (key: TKey, value: TValue) => {
    myStorage.set(key, value)
  }
  const removeStored = (key: TKey) => {
    myStorage.delete(key)
  }
  const getOrStore = (key: TKey, getValue: () => TValue) => {
    if (isStored(key)) return getStored(key)

    const value = getValue()
    store(key, value)
    return value
  }

  return {
    getOrStore,
    isStored,
    getStored,
    store,
    removeStored,
  }
}

export const createStorage = <TKey, TValue>(storage?: Map<TKey, TValue>): IStorage<TKey, TValue> => {
  const myStorage = storage || new Map()
  const isStored = (key: TKey) => myStorage.has(key)
  const getStored = (key: TKey) => myStorage.get(key)
  const store = (key: TKey, value: TValue) => {
    myStorage.set(key, value)
  }
  const removeStored = (key: TKey) => {
    myStorage.delete(key)
  }
  const getOrStore = (key: TKey, getValue: () => TValue) => {
    if (isStored(key)) return getStored(key)

    const value = getValue()
    store(key, value)
    return value
  }
  const clear = () => {
    myStorage.clear()
  }

  return {
    getOrStore,
    isStored,
    getStored,
    store,
    removeStored,
    clear,
  }
}
