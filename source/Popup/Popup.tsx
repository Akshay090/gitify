import React, {useState, useEffect} from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';
import axios from 'axios';

import Logo from '../assets/icons/favicon-32.png';
import SetingsLogo from '../assets/icons/settings.svg';
import './styles.scss';

// function openWebPage(url: string): Promise<Tabs.Tab> {
//   return browser.tabs.create({url});
// }

const getTabs = (): Promise<Tabs.Tab[]> => {
  return browser.tabs.query({
    currentWindow: true,
    active: true,
  });
};

const Popup: React.FC = () => {
  const [query, setQuery] = useState({});
  const [api, setApi] = useState('');

  const parseUrl = async (): Promise<string | undefined> => {
    const tabs = await getTabs();
    const tabURL = tabs[0].url;
    if (tabURL !== undefined) {
      const urlParts = tabURL.split('/');
      const domain = urlParts[2];
      const gitUserName = urlParts[3];
      const projectName = urlParts[4];
      console.log(gitUserName, projectName);

      const queryObj = {
        Domain: domain,
        RepoURL: tabURL,
        GitUserName: gitUserName,
        ProjectName: projectName,
      };
      setQuery(queryObj);
    }
    return tabs[0].url;
  };

  useEffect(() => {
    const fetchData = async (): Promise<Function> => {
      try {
        if (Object.keys(query).length !== 0) {
          await axios.post(api, query);
        }
      } catch (err) {
        console.log('error', err);
      }
      console.log();

      return (): void => {
        setQuery({});
      };
    };

    fetchData();
  }, [query, api]);

  const gitClone = (): void => {
    setApi('http://localhost:5000/gitClone');
    parseUrl();
  };

  const openVsCode = (): void => {
    setApi('http://localhost:5000/openVsCode');
    parseUrl();
  };

  const gitPush = (): void => {
    setApi('http://localhost:5000/gitPush');
    parseUrl();
  };
  return (
    <section id="popup">
      <div className="heading">
        <img src={Logo} alt="" />
        <img src={SetingsLogo} alt="" />
      </div>
      <p className="message">Clone and open the repo in vs code</p>
      <div className="container">
        <button type="button" className="green btn" onClick={gitClone}>
          git clone
        </button>
        <button type="button" className="orange btn" onClick={openVsCode}>
          open in code
        </button>
        <button type="button" className="red btn" onClick={gitPush}>
          git push
        </button>
      </div>
    </section>
  );
};

export default Popup;
