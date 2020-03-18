import {
  complement,
  curryN,
  equals,
  flip,
  includes,
  intersection,
  invoker,
  isEmpty,
  keys,
  pick,
  sort,
} from 'ramda'

export const isNotEmpty = complement(isEmpty)
export const includesFlipped = curryN(2, flip(includes))

export const objectEqualsByIntersectionKeys = (objA: object, objB: object) => {
  const pickIntersection = pick(intersection(keys(objA), keys(objB)))

  return equals(
    pickIntersection(objA),
    pickIntersection(objB),
  )
}

export const objectEqualsByFirstObjectKeys = (objA: object, objB: object) => {
  const objAKeys = keys(objA)

  return equals(
    pick(objAKeys, objA),
    pick(objAKeys, objB),
  )
}

const localeCompareInvoker = invoker(1, 'localeCompare')

export const sortStringsAsc: (strings: string[]) => string[] = sort(flip(localeCompareInvoker))
