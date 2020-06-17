import React, {useState, useRef, useEffect} from 'react';
import {browser, Runtime, Storage} from 'webextension-polyfill-ts';

import './styles.scss';

function platfromInfo(): Promise<Runtime.PlatformInfo> {
  return browser.runtime.getPlatformInfo();
}

function saveStorage(items: Storage.StorageAreaSetItemsType): Promise<void> {
  console.log('save storage called');
  return browser.storage.sync.set(items);
}

function getStorage(
  item: string
): Promise<{
  [s: string]: string;
}> {
  return browser.storage.sync.get(item);
}

async function initializeOsInfo(): Promise<{os: string; rootPath: string}> {
  const info = await platfromInfo();
  const {os} = info;

  await saveStorage({os});

  const rootPathObj = await getStorage('rootPath');
  let {rootPath} = rootPathObj;
  console.log(rootPath);
  if (rootPath === undefined) {
    if (os === 'win') {
      rootPath = 'win Root Path';
    } else if (os === 'linux') {
      rootPath = 'linux Root Path';
    } else if (os === 'mac') {
      rootPath = 'mac Root Path';
    }
    await saveStorage({rootPath});
  }
  // const osP = await getStorage('os');
  // console.log(osP);

  return {os, rootPath}; // "win" "mac" "linux"
}

const useIsMount = (): boolean => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

const Options: React.FC = () => {
  const isMount = useIsMount();

  // const [rootFL, setRootFL] = useState('');
  const [inpRootFL, setInpRootFL] = useState('');

  useEffect(() => {
    if (isMount) {
      console.log('called for first mount');
      const initRootPath = async (): Promise<void> => {
        const {rootPath} = await initializeOsInfo();
        setInpRootFL(rootPath);
      };
      initRootPath();
    }
  }, [isMount]);

  const updateRootFL = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    saveStorage({rootPath: inpRootFL});
  };
  return (
    <div className="container">
      <div className="heading_wrapper">
        <h1 className="heading">Gitify ⚙</h1>
      </div>
      <hr />

      <form>
        <div className="block">
          <label htmlFor="rootFL">Root Folder Location</label>
          <input
            // defaultValue={rootFL}
            name="rootFL"
            placeholder={inpRootFL}
            value={inpRootFL}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setInpRootFL(e.target.value);
            }}
          />
        </div>

        <div className="horizontal">
          <button
            type="submit"
            className="black btn submit"
            onClick={updateRootFL}
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Options;
