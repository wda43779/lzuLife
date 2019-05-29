const comb: <T extends object>(src: any, defaultValue: T) => T = <T>(
  src: object = {},
  defaultValue: T
): T => {
  const ret: T = { ...src } as T;
  for (const keys of Object.keys(defaultValue)) {
    if (typeof defaultValue[keys] === "number") {
      if (typeof ret[keys] === "string") {
        ret[keys] = parseInt(ret[keys]);
      } else if (typeof ret[keys] === "number") {
      } else {
        ret[keys] = defaultValue[keys];
      }
    } else if (typeof defaultValue[keys] === "string") {
      if (typeof ret[keys] !== "string") {
        ret[keys] = defaultValue[keys];
      }
    } else if (typeof defaultValue[keys] === "object") {
      if (!ret[keys]) {
        ret[keys] = { ...defaultValue[keys] };
      } else if (typeof ret[keys] !== "object") {
        ret[keys] = { ...defaultValue[keys] };
      }
    }
  }
  return ret;
};

export default comb;
