import {browser, Runtime, Storage, Tabs} from 'webextension-polyfill-ts';
import {useRef, useEffect} from 'react';

export function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

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
      rootPath = 'Set a folder path for gitify';
    } else if (os === 'linux') {
      rootPath = 'Gitify Currently dont work in linux';
    } else if (os === 'mac') {
      rootPath = 'Gitify Currently dont work in mac';
    }
    await saveStorage({rootPath});
  }

  return {os, rootPath}; // "win" "mac" "linux"
}

export const getTabs = (): Promise<Tabs.Tab[]> => {
  return browser.tabs.query({
    currentWindow: true,
    active: true,
  });
};

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

// https://stackoverflow.com/a/59843241
const usePrevious = (
  value: React.DependencyList,
  initialValue: React.DependencyList
): React.DependencyList => {
  const ref = useRef(initialValue);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useEffectDebugger = (
  effectHook: React.EffectCallback,
  dependencies: React.DependencyList,
  dependencyNames: string[] = []
): {} | void => {
  const previousDeps = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log('[use-effect-debugger] ', changedDeps);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effectHook, dependencies);
};
