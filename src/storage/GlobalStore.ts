class GlobalStore {
  private static instance: GlobalStore;
  private store: { [key: string]: any };

  private constructor() {
    this.store = {};
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public setValue(key: string, value: any): void {
    this.store[key] = value;
  }

  public getValue(key: string): any {
    return this.store[key];
  }

  public hasValue(key: string): boolean {
    return key in this.store;
  }

  public removeValue(key: string): void {
    delete this.store[key];
  }

  public clearStore(): void {
    this.store = {};
  }

  public getAllKeys(): string[] {
    return Object.keys(this.store);
  }
}

export default GlobalStore;

// Example usage:
/*
import GlobalStore from './GlobalStore';

// Get the singleton instance
const store = GlobalStore.getInstance();

// Set values
store.setValue('userToken', 'abc123');
store.setValue('userId', 42);

// Get values
const token = store.getValue('userToken'); // Returns 'abc123'
const hasUser = store.hasValue('userId'); // Returns true

// Remove a value
store.removeValue('userToken');

// Clear all values
store.clearStore();
*/
