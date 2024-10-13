export const autoTrim = (object: any) => {
  for (const [key, value] of Object.entries(object)) {
    if (typeof value === 'string') {
      object[key] = value.trim();
    }
  }
};
