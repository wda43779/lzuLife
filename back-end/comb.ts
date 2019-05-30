import { ObjectID } from "mongodb";

const emptyObjectID = new ObjectID("000000000000000000000000");

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
    } else if (typeof defaultValue[keys] === "boolean") {
      if (typeof ret[keys] === "string") {
        switch (ret[keys]) {
          case "TRUE":
          case "True":
          case "true":
            ret[keys] = true;
            break;
          case "FALSE":
          case "False":
          case "false":
            ret[keys] = false;
            break;
          default:
            ret[keys] = defaultValue[keys];
        }
      } else if (typeof ret[keys] === "boolean") {
      } else {
        ret[keys] = defaultValue[keys];
      }
    } else if (typeof defaultValue[keys] === "string") {
      if (typeof ret[keys] !== "string") {
        ret[keys] = defaultValue[keys];
      }
    } else if (defaultValue[keys] instanceof ObjectID) {
      if (typeof ret[keys] === "string") {
        if (ret[keys].length !== 24) {
          ret[keys] = defaultValue[keys];
        } else {
          ret[keys] = new ObjectID(ret[keys]);
        }
      } else if (ret[keys] instanceof ObjectID) {
      } else {
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
export { emptyObjectID };
