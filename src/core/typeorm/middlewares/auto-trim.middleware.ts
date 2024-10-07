export const autoTrim = (entity: any) => {
  for (const [key, value] of Object.entries(entity)) {
    if (typeof value === 'string') {
      entity[key] = value.trim();
    }
  }
};
