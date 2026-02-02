'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type LocalStorageValue<T> = T | null;

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

interface UseLocalStorageReturn<T> {
  value: LocalStorageValue<T>;
  setValue: (value: T | ((prev: LocalStorageValue<T>) => T)) => void;
  removeValue: () => void;
  isPersistent: boolean;
}

const isBrowser = typeof window !== 'undefined';

const defaultSerializer = <T>(value: T): string => {
  try {
    return JSON.stringify(value);
  } catch {
    throw new Error('Failed to serialize value');
  }
};

const defaultDeserializer = <T>(value: string): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error('Failed to deserialize value');
  }
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError
  } = options;

  const [storedValue, setStoredValue] = useState<LocalStorageValue<T>>(() => {
    if (!isBrowser) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError?.(error as Error);
      return initialValue;
    }
  });

  const [isPersistent, setIsPersistent] = useState(true);
  const initialValueRef = useRef(initialValue);

  const setValue = useCallback((value: T | ((prev: LocalStorageValue<T>) => T)) => {
    if (!isBrowser) return;

    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
      setIsPersistent(true);
    } catch (error) {
      onError?.(error as Error);
      setIsPersistent(false);
    }
  }, [key, serializer, storedValue, onError]);

  const removeValue = useCallback(() => {
    if (!isBrowser) return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
      setIsPersistent(true);
    } catch (error) {
      onError?.(error as Error);
      setIsPersistent(false);
    }
  }, [key, onError]);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
          const newValue = event.newValue ? deserializer(event.newValue) : initialValueRef.current;
          setStoredValue(newValue);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    const checkPersistency = () => {
      try {
        const testKey = `__persistence_test_${Date.now()}__`;
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        setIsPersistent(true);
      } catch {
        setIsPersistent(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', checkPersistency);

    checkPersistency();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkPersistency);
    };
  }, [key, deserializer, onError]);

  useEffect(() => {
    if (!isBrowser || !storedValue) return;

    const syncWithServer = async () => {
      try {
        const authToken = window.localStorage.getItem('nexus_auth_token');
        if (!authToken) return;

        await fetch('/api/sync-storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ key, value: storedValue })
        });
      } catch (error) {
        onError?.(error as Error);
      }
    };

    syncWithServer();
  }, [key, storedValue, onError]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isPersistent
  };
}

export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
) {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setValue(prev => [...(prev || []), item]);
  }, [setValue]);

  const removeItem = useCallback((index: number) => {
    setValue(prev => {
      if (!prev) return [];
      return prev.filter((_, i) => i !== index);
    });
  }, [setValue]);

  const updateItem = useCallback((index: number, item: T) => {
    setValue(prev => {
      if (!prev) return [];
      const newArray = [...prev];
      newArray[index] = item;
      return newArray;
    });
  }, [setValue]);

  const clearAll = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    items: value || [],
    addItem,
    removeItem,
    updateItem,
    clearAll,
    removeStorage: removeValue,
    isPersistent
  };
}

export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T>(key, initialValue);

  const updateField = useCallback(<K extends keyof T>(field: K, fieldValue: T[K]) => {
    setValue(prev => ({
      ...(prev || initialValue),
      [field]: fieldValue
    }));
  }, [setValue, initialValue]);

  const mergeObject = useCallback((partialObject: Partial<T>) => {
    setValue(prev => ({
      ...(prev || initialValue),
      ...partialObject
    }));
  }, [setValue, initialValue]);

  return {
    data: value || initialValue,
    updateField,
    mergeObject,
    removeStorage: removeValue,
    isPersistent
  };
}

export function useLocalStorageWithExpiry<T>(
  key: string,
  initialValue: T,
  ttl: number
) {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<{
    value: T;
    expiry: number;
  }>(key, { value: initialValue, expiry: Date.now() + ttl });

  const setValueWithExpiry = useCallback((newValue: T) => {
    setValue({
      value: newValue,
      expiry: Date.now() + ttl
    });
  }, [setValue, ttl]);

  const currentValue = (() => {
    if (!value || Date.now() > value.expiry) {
      removeValue();
      return initialValue;
    }
    return value.value;
  })();

  useEffect(() => {
    if (!value) return;

    const timeLeft = value.expiry - Date.now();
    if (timeLeft <= 0) {
      removeValue();
      return;
    }

    const timeoutId = setTimeout(() => {
      removeValue();
    }, timeLeft);

    return () => clearTimeout(timeoutId);
  }, [value, removeValue]);

  return {
    value: currentValue,
    setValue: setValueWithExpiry,
    removeValue,
    isPersistent
  };
}