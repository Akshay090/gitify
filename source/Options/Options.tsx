import React, {useState, useEffect} from 'react';

import './styles.scss';
import {useIsMount, initReadOsInfo, saveStorage} from '../utils';

const Options: React.FC = () => {
  const isMount = useIsMount();

  const [rootFL, setRootFL] = useState('');

  useEffect(() => {
    if (isMount) {
      console.log('called for first mount');
      const initRootPath = async (): Promise<void> => {
        const {rootPath} = await initReadOsInfo();
        setRootFL(rootPath);
      };
      initRootPath();
    }
  }, [isMount]);

  const updateRootFL = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    saveStorage({rootPath: rootFL});
  };
  return (
    <div className="container">
      <div className="heading_wrapper">
        <h1 className="heading">Gitify 🛠️</h1>
      </div>
      <hr />

      <form>
        <div className="block">
          <label htmlFor="rootFL">Root Folder Location</label>
          <input
            name="rootFL"
            placeholder={rootFL}
            value={rootFL}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
              setRootFL(e.target.value);
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
