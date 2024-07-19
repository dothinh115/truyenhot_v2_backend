import 'reflect-metadata';

export const addMetadata = (key: string, value: any) => {
  return (target: Object, propertyKey: string | symbol) =>
    Reflect.defineMetadata(key, value, target, propertyKey);
};

export const getMetadata = (
  key: string,
  target: Object,
  propertyKey?: string | symbol,
) => {
  return Reflect.getMetadata(key, target, propertyKey);
};

export const getAllMetadata = (
  target: Object,
  propertyKey: string | symbol,
) => {
  const keys = Reflect.getMetadataKeys(target, propertyKey);
  const result = {};
  for (const key of keys) {
    result[key] = getMetadata(key, target, propertyKey);
  }
  return result;
};
