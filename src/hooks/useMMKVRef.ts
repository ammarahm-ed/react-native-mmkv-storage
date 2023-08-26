/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2023 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { useEffect, useRef } from 'react';
import MMKVInstance from '../mmkvinstance';

export function useMMKVRef<T>(
  key: string,
  storage: MMKVInstance,
  defaultValue: T
): {
  current: T;
  reset(): void;
} {
  const refKey = `__mmkvref:${key}`;
  const value = useRef<T>(storage.getMap<{ current: T }>(refKey)?.current || defaultValue);
  const frameRef = useRef(0);

  useEffect(() => {
    const onWrite = event => {
      value.current = event.value;
    };
    if (storage !== null) {
      storage.ev.subscribe(`${key}:onwrite`, onWrite);
    }
    return () => {
      if (storage != null) {
        storage.ev.unsubscribe(`${key}:onwrite`, onWrite);
      }
    };
  }, [key, storage]);

  return {
    get current() {
      return value.current;
    },
    set current(next: T) {
      value.current = next;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        storage.setMap(refKey, {
          current: value.current
        });
      });
    },
    reset() {
      storage.removeItem(refKey);
    }
  };
}

export const createMMKVRefHookForStorage =
  (storage: MMKVInstance) =>
  <T>(key: string, defaultValue?: T) => {
    if (!key || typeof key !== 'string' || !storage)
      throw new Error('Key and Storage are required parameters.');

    return useMMKVRef<T>(key, storage, defaultValue as T);
  };
