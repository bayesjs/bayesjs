import * as expect from 'expect'

import { IStorage, IWeakStorage } from '../../src/types'
import { createStorage, createWeakStorage } from '../../src/utils'

describe('Storage Utils', () => {
  describe('createWeakStorage', () => {
    let storage: IWeakStorage<object, unknown>

    beforeEach(() => {
      storage = createWeakStorage()
    })

    it('should store value', () => {
      const key = { foo: 'bar' }
      const value = { name: 'Jonas' }

      expect(storage.isStored(key)).toBeFalsy()
      storage.store(key, value)
      expect(storage.isStored(key)).toBeTruthy()
      expect(storage.getStored(key)).toEqual(value)
    })

    it('should remove value', () => {
      const key = { foo: 'bar' }
      const value = { name: 'Jonas' }

      storage.store(key, value)
      storage.removeStored(key)
      expect(storage.isStored(key)).toBeFalsy()
    })

    it('should store if value doesnt exists', () => {
      const key = { foo: 'bar' }
      const value1 = { name: 'Jonas' }
      const valueStored1 = storage.getOrStore(key, () => value1)

      expect(valueStored1).toBe(value1)
      expect(storage.getStored(key)).toBe(value1)
      expect(storage.isStored(key)).toBeTruthy()
    })

    it('should not store if value exists', () => {
      const key = { foo: 'bar' }
      const value1 = { name: 'Jonas' }
      const value2 = { name: 'Philip' }

      const valueStored1 = storage.getOrStore(key, () => value1)
      const valueStored2 = storage.getOrStore(key, () => value2)

      expect(valueStored1).toBe(value1)
      expect(valueStored2).toBe(value1)// already stored
    })
  })

  describe('createStorage', () => {
    let storage: IStorage<string, unknown>

    beforeEach(() => {
      storage = createStorage()
    })

    it('should store value', () => {
      const key = 'bar'
      const value = { name: 'Jonas' }

      expect(storage.isStored(key)).toBeFalsy()
      storage.store(key, value)
      expect(storage.isStored(key)).toBeTruthy()
      expect(storage.getStored(key)).toEqual(value)
    })

    it('should remove value', () => {
      const key = 'bar'
      const value = { name: 'Jonas' }

      storage.store(key, value)
      storage.removeStored(key)
      expect(storage.isStored(key)).toBeFalsy()
    })

    it('should store if value doesnt exists', () => {
      const key = 'bar'
      const value1 = { name: 'Jonas' }
      const valueStored1 = storage.getOrStore(key, () => value1)

      expect(valueStored1).toBe(value1)
      expect(storage.getStored(key)).toBe(value1)
      expect(storage.isStored(key)).toBeTruthy()
    })

    it('should not store if value exists', () => {
      const key = 'bar'
      const value1 = { name: 'Jonas' }
      const value2 = { name: 'Philip' }

      const valueStored1 = storage.getOrStore(key, () => value1)
      const valueStored2 = storage.getOrStore(key, () => value2)

      expect(valueStored1).toBe(value1)
      expect(valueStored2).toBe(value1)// already stored
    })

    it('should clear all values', () => {
      const keys = ['key1', 'key2', 'key3', 'key4']

      keys.map((key, i) => storage.store(key, i))
      const allStorage = keys.every(key => storage.isStored(key))

      expect(allStorage).toBeTruthy()
      if (storage.clear) storage.clear()

      const allNotStorage = keys.every(key => !storage.isStored(key))
      expect(allNotStorage).toBeTruthy()
    })
  })
})
