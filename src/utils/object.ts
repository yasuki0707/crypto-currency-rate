// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const isObjectEmpty = (obj: any): boolean => {
  for (const i in obj) return false;
  return true;
};
