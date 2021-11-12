export function errorToObject<T extends Error>(error: T): T {
  return {
    ...error,
    name: error.name,
    stack: error.stack,
  };
}
