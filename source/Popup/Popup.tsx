import React, {useState, useEffect, useRef} from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';
import axios from 'axios';
import {Check, ChevronDown, X, Loader} from 'react-feather';
import Button from './Button';
import './styles.scss';

// function openWebPage(url: string): Promise<Tabs.Tab> {
//   return browser.tabs.create({url});
// }
axios.defaults.baseURL = 'http://localhost:5000';

type TrueFalseNull = true | false | null;
// const ERROR_STATUS = 'ERROR_STATUS';
const REQUESTED: TrueFalseNull = null;
const SUCCESS_STATUS: TrueFalseNull = null;
interface ApiDetails {
  api: string;
  status: TrueFalseNull;
  requested: TrueFalseNull;
}
interface ApiList {
  [gitClone: string]: ApiDetails;
  openVSCode: ApiDetails;
  gitPush: ApiDetails;
}
const API_LIST: ApiList = {
  gitClone: {api: 'gitClone', status: SUCCESS_STATUS, requested: REQUESTED},
  openVSCode: {api: 'openVSCode', status: SUCCESS_STATUS, requested: REQUESTED},
  gitPush: {api: 'gitPush', status: SUCCESS_STATUS, requested: REQUESTED},
};

const useIsMount = (): boolean => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

const getTabs = (): Promise<Tabs.Tab[]> => {
  return browser.tabs.query({
    currentWindow: true,
    active: true,
  });
};

const Popup: React.FC = () => {
  const isMount = useIsMount();

  const [query, setQuery] = useState({});
  const [api, setApi] = useState('');
  const [apiList, setApiList] = useState(API_LIST);

  const parseUrl = async (): Promise<string | undefined> => {
    const tabs = await getTabs();
    const tabURL = tabs[0].url;
    if (tabURL !== undefined) {
      const urlParts = tabURL.split('/');
      const domain = urlParts[2];
      const gitUserName = urlParts[3];
      const projectName = urlParts[4];
      // console.log(gitUserName, projectName);

      const queryObj = {
        Domain: domain,
        RepoURL: tabURL,
        GitUserName: gitUserName,
        ProjectName: projectName,
      };
      setQuery(queryObj);
      // console.log('setQuery(queryObj)');
    }
    return tabs[0].url;
  };

  useEffect(() => {
    const fetchData = async (): Promise<Function> => {
      try {
        if (Object.keys(query).length > 0 && apiList[api].requested === true) {
          await axios.post(`/${api}`, query);
          const newStatus: ApiDetails = {
            api,
            status: SUCCESS_STATUS,
            requested: false,
          };
          const apiListClone: ApiList = Object.create(apiList);
          apiListClone[api] = newStatus;
          setApiList(apiListClone);
        }
      } catch (err) {
        console.log('error', err);
        const newStatus: ApiDetails = {
          api,
          status: !SUCCESS_STATUS,
          requested: false,
        };
        const apiListClone: ApiList = Object.create(apiList);
        apiListClone[api] = newStatus;
        setApiList(apiListClone);
      }

      return (): void => {
        // setQuery({});
        console.log('use effect clean up');
      };
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, query]);

  const setRequested = (): void => {
    const newStatus: ApiDetails = {
      api,
      status: SUCCESS_STATUS,
      requested: true,
    };
    const apiListClone: ApiList = Object.create(apiList);
    apiListClone[api] = newStatus;
    setApiList(apiListClone);
  };

  useEffect(() => {
    if (!isMount) {
      setRequested();
      parseUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const gitClone = (): void => {
    setApi(API_LIST.gitClone.api);
  };

  const openVsCode = (): void => {
    setApi(API_LIST.openVSCode.api);
  };

  const gitPush = (): void => {
    setApi(API_LIST.gitPush.api);
  };

  return (
    <section id="popup">
      <div className="heading">
        <img src="assets/icons/favicon-32.png" alt="" />
        <img src="assets/icons/settings.svg" alt="" />
      </div>
      <p className="message">Clone and open the repo in vs code</p>
      <div className="container">
        <Button BtnTheme="green" BtnText=" git clone" BtnClickFxn={gitClone}>
          {apiList.gitClone.requested && apiList.gitClone.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitClone.status &&
          apiList.gitClone.status === SUCCESS_STATUS ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitClone.status === !SUCCESS_STATUS ? (
            <X style={{marginRight: '1rem'}} color="Red" />
          ) : null}
        </Button>
        <Button
          BtnTheme="orange"
          BtnText="open in code"
          BtnClickFxn={openVsCode}
        >
          {apiList.openVSCode.requested &&
          apiList.openVSCode.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.openVSCode.status &&
          apiList.openVSCode.status === SUCCESS_STATUS ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.openVSCode.status === !SUCCESS_STATUS ? (
            <X style={{marginRight: '1rem'}} color="Red" />
          ) : null}
        </Button>

        <Button BtnTheme="red" BtnText="git push" BtnClickFxn={gitPush}>
          {apiList.gitPush.requested && apiList.gitPush.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitPush.requested === null ? (
            <ChevronDown
              style={{marginRight: '1rem'}}
              onClick={(): void => console.log('down click')}
            />
          ) : null}
          {apiList.gitPush.status &&
          apiList.gitPush.status === SUCCESS_STATUS ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitPush.status === !SUCCESS_STATUS ? (
            <X style={{marginRight: '1rem'}} color="Red" />
          ) : null}
        </Button>
      </div>
    </section>
  );
};

export default Popup;
