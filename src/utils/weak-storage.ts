export class WeakStorage<TKey extends object, TValue> {
  _map = new WeakMap<TKey, TValue>();
  _defaultFn: () => TValue;

  constructor(defaultFn: () => TValue) {
    this._defaultFn = defaultFn;
  }

  get(key: TKey): TValue {
    if (this._map.has(key)) {
      return this._map.get(key)!;
    }
    const obj = this._defaultFn();
    this._map.set(key, obj);
    return obj;
  }

  set(key: TKey, data: Partial<TValue>): TValue {
    const processedData = {
      ...this.get(key),
      ...data,
    };
    this._map.set(key, processedData);
    return processedData;
  }
}
