const getType = (v: any) => (([]).toString.call(v).slice(7, -1).toLowerCase());
export const combineTsConfig = (config, ...tsConfig: any[]) => {
  const combined = config || {};
  for (const config of tsConfig || []) {
    for (const key in config || {}) {
      const value = config[key];
      const valueType = getType(value);
      if (valueType === 'object') {
        if (!combined[key]) {
          combined[key] = {};
        }
        Object.assign(combined[key], value);
      } else if (valueType === 'array') {
        if (!combined[key]) {
          combined[key] = [];
        }
        combined[key].push(...value);
      } else {
        combined[key] = value;
      }
    }
  }
  return combined;
};
