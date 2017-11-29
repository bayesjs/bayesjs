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
  'Map': createStorage,
  'Weak Map': createWeakStorage,
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
  });
});