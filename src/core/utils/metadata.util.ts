import 'reflect-metadata';

export const addMetadata = (key: string | symbol, value: any) => {
  return (target: Object, propertyKey: string | symbol) =>
    Reflect.defineMetadata(key, value, target, propertyKey);
};

export const getMetadata = <T>(
  key: string | symbol,
  target: Object,
  propertyKey?: string | symbol,
): T => {
  return Reflect.getMetadata(key, target, propertyKey);
};

export const getAllMetadata = <T>(
  target: Object,
  propertyKey: string | symbol,
): T => {
  const keys = Reflect.getMetadataKeys(target, propertyKey);
  let result = {};
  for (const key of keys) {
    result[key] = getMetadata(key, target, propertyKey);
  }
  return result as T;
};
