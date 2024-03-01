export function intersectObjects<T extends object, U extends object>(
  obj1: T,
  obj2: U
): Partial<T> {
  const keysObj1 = Object.keys(obj1) as (keyof T)[]
  const keysObj2 = new Set(Object.keys(obj2) as (keyof T)[])
  const intersectKeys = keysObj1.filter((key) => keysObj2.has(key))

  const result: Partial<T> = {}
  intersectKeys.forEach((key) => {
    result[key] = obj1[key]
  })

  return result
}

export function intersectObjectsToArray<T extends object, U extends object>(
  obj1: T,
  obj2: U
) {
  const keysObj1 = Object.keys(obj1) as (keyof T)[]
  const keysObj2 = new Set(Object.keys(obj2) as (keyof T)[])
  const intersectKeys = keysObj1.filter((key) => keysObj2.has(key))

  return intersectKeys.map((k) => obj1[k])
}
