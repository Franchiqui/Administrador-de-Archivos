import { useState, useEffect, useRef, useCallback } from 'react';

export type DebounceOptions = {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
};

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  isPending: () => boolean;
};

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const {
    delay = 300,
    leading = false,
    trailing = true,
    maxWait,
  } = options;

  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastThisRef = useRef<any>(null);
  const resultRef = useRef<ReturnType<T>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clearTimeoutIfExists = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const isPending = useCallback((): boolean => {
    return timeoutRef.current !== null;
  }, []);

  const flush = useCallback((): void => {
    if (!lastArgsRef.current) return;

    resultRef.current = callbackRef.current.apply(lastThisRef.current, lastArgsRef.current);
    clearTimeoutIfExists();
    lastArgsRef.current = null;
    lastThisRef.current = null;
    lastCallTimeRef.current = null;
  }, [clearTimeoutIfExists]);

  const cancel = useCallback((): void => {
    clearTimeoutIfExists();
    lastArgsRef.current = null;
    lastThisRef.current = null;
    lastCallTimeRef.current = null;
  }, [clearTimeoutIfExists]);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const isLeadingCall = leading && lastCallTimeRef.current === null;

      lastArgsRef.current = args;
      lastThisRef.current = this;
      lastCallTimeRef.current = now;

      if (isLeadingCall) {
        resultRef.current = callbackRef.current.apply(this, args);
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (maxWait !== undefined) {
        const timeSinceLastCall = now - (lastCallTimeRef.current || 0);
        const timeUntilMaxWait = maxWait - timeSinceLastCall;

        if (timeUntilMaxWait <= 0) {
          flush();
          return;
        }
      }

      timeoutRef.current = setTimeout(() => {
        const shouldCallTrailing = trailing || (lastCallTimeRef.current !== now);

        if (shouldCallTrailing && lastArgsRef.current) {
          resultRef.current = callbackRef.current.apply(lastThisRef.current, lastArgsRef.current);
        }

        timeoutRef.current = null;
        lastArgsRef.current = null;
        lastThisRef.current = null;
        lastCallTimeRef.current = null;
      }, delay);
    },
    [delay, leading, trailing, maxWait, flush]
  ) as DebouncedFunction<T>;

  useEffect(() => {
    return () => {
      clearTimeoutIfExists();
    };
  }, [clearTimeoutIfExists]);

  Object.assign(debouncedFunction, {
    cancel,
    flush,
    isPending,
  });

  return debouncedFunction;
}

export function useDebounceValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  dependencies: any[] = []
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    useDebounce((...args: Parameters<T>) => {
      callbackRef.current(...args);
    }, { delay }),
    [delay, ...dependencies]
  );
}