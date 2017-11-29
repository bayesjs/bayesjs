import * as expect from 'expect';
import { createWeakStorage, createStorage } from '../../src/utils/index';


const shouldStoreValue = (storage) => {
  const key = { foo: 'bar'};
  const value = { name: 'Jonas' };

  expect(storage.isStored(key)).toBeFalsy();
  storage.store(key, value);
  expect(storage.isStored(key)).toBeTruthy();
  expect(storage.getStored(key)).toEqual(value);
};

const shouldRemoveValue = (storage) => {
  const key = { foo: 'bar'};
  const value = { name: 'Jonas' };

  storage.store(key, value);
  storage.removeStored(key);
  expect(storage.isStored(key)).toBeFalsy();
};

const shouldStoreIfValueDoesntExists = (storage) => {
  const key = { foo: 'bar'};
  const value1 = { name: 'Jonas' };
  const valueStored1 = storage.getOrStore(key, () => value1);
  
  expect(valueStored1).toBe(value1);
  expect(storage.getStored(key)).toBe(value1);
  expect(storage.isStored(key)).toBeTruthy();
}

const shouldNotStoreIfValueExists = (storage) => {
  const key = { foo: 'bar'};
  const value1 = { name: 'Jonas' };
  const value2 = { name: 'Philip' };

  const valueStored1 = storage.getOrStore(key, () => value1);
  const valueStored2 = storage.getOrStore(key, () => value2);
  
  expect(valueStored1).toBe(value1);
  expect(valueStored2).toBe(value1);//already stored
}

const stores = {
  'Weak Map': createWeakStorage,
  'Map': createStorage,
};

const tests = {
  'should store value': shouldStoreValue,
  'should remove value': shouldRemoveValue,
  'should store if value doesnt exists': shouldStoreIfValueDoesntExists,
  'should not store if value exists': shouldNotStoreIfValueExists,
}

describe('utils', () => {
  describe('storage', () => {
    const storesNames = Object.keys(stores);
    const testsNames = Object.keys(tests);

    for (const storeName of storesNames) {
      const store = stores[storeName];

      for (const testName of testsNames) {
        const testMethod = tests[testName];
        const storage = store();

        it(
          `[${storeName}] ${testName}`,
          () => testMethod(storage)
        );
      }
    }

    it('[Map] should clear all values', () => {
      const storage = createStorage();
      const keys = ['key1', 'key2', 'key3', 'key4'];

      keys.map((key, i) => storage.store(key, i));
      const allStorage = keys.every(key => storage.isStored(key));

      expect(allStorage).toBeTruthy();
      storage.clear();
      
      const allNotStorage = keys.every(key => !storage.isStored(key));
      expect(allStorage).toBeTruthy();
    })
  });
});