import {browser, Runtime, Storage, Tabs} from 'webextension-polyfill-ts';
import {useRef, useEffect} from 'react';

export function platfromInfo(): Promise<Runtime.PlatformInfo> {
  return browser.runtime.getPlatformInfo();
}

export function saveStorage(
  items: Storage.StorageAreaSetItemsType
): Promise<void> {
  console.log('save storage called');
  return browser.storage.sync.set(items);
}

export function getStorage(
  item: string
): Promise<{
  [s: string]: string;
}> {
  return browser.storage.sync.get(item);
}

export async function initReadOsInfo(): Promise<{
  os: string;
  rootPath: string;
}> {
  const info = await platfromInfo();
  const {os} = info;

  await saveStorage({os});

  const rootPathObj = await getStorage('rootPath');
  let {rootPath} = rootPathObj;
  console.log(rootPath);
  if (rootPath === undefined) {
    if (os === 'win') {
      rootPath = '%UserProfile%\\gitify';
    } else if (os === 'linux') {
      rootPath = 'linux Root Path';
    } else if (os === 'mac') {
      rootPath = 'mac Root Path';
    }
    await saveStorage({rootPath});
  }

  return {os, rootPath}; // "win" "mac" "linux"
}

/**
 * Usage :
 *
 *  ```
 *    const isMount = useIsMount();
 *
 *    useEffect(() => {
 *      if (isMount) {
 *       console.log('First Render');
 *     } else {
 *        console.log('Subsequent Render');
 *      }
 *    });
 *  ```
 */
export const useIsMount = (): boolean => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

export const getTabs = (): Promise<Tabs.Tab[]> => {
  return browser.tabs.query({
    currentWindow: true,
    active: true,
  });
};
