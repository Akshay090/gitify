import React, {useState, useEffect} from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';
import axios from 'axios';
import {Check, ChevronDown, X, Loader} from 'react-feather';
import Button from './Button';
import './styles.scss';
import {useIsMount, getTabs, initReadOsInfo} from '../utils';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

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
interface ReqParams {
  [Domain: string]: string;
  RepoURL: string;
  GitUserName: string;
  ProjectName: string;
  RootPath: string;
}
const API_LIST: ApiList = {
  gitClone: {api: 'gitClone', status: SUCCESS_STATUS, requested: REQUESTED},
  openVSCode: {api: 'openVSCode', status: SUCCESS_STATUS, requested: REQUESTED},
  gitPush: {api: 'gitPush', status: SUCCESS_STATUS, requested: REQUESTED},
};

const Popup: React.FC = () => {
  const isMount = useIsMount();

  const [repoStatus, setRepoStatus] = useState(false);
  const [serverExist, setServerExist] = useState(true);
  const [query, setQuery] = useState({});
  const [api, setApi] = useState('');
  const [apiList, setApiList] = useState(API_LIST);

  const parseUrl = async (): Promise<void> => {
    const tabs = await getTabs();
    const {rootPath} = await initReadOsInfo();

    const tabURL = tabs[0].url;
    if (tabURL !== undefined) {
      const urlParts = tabURL.split('/');
      const domain = urlParts[2];
      const gitUserName = urlParts[3];
      const projectName = urlParts[4];
      // console.log(gitUserName, projectName);

      const queryObj: ReqParams = {
        Domain: domain,
        RepoURL: tabURL,
        GitUserName: gitUserName,
        ProjectName: projectName,
        RootPath: rootPath,
      };
      setQuery(queryObj);
    }
  };

  useEffect(() => {
    const checkServerDirExist = async (): Promise<void> => {
      try {
        if (Object.keys(query).length > 0) {
          const res = await axios.post(`/repoExists`, query);
          console.log(res, 'repoExists res');
          const {Exist}: {Exist: boolean} = res.data;
          if (Exist) {
            console.log('repo exist');
            setRepoStatus(true);

            const newStatus: ApiDetails = {
              api: API_LIST.gitClone.api,
              status: true,
              requested: false,
            };
            const apiListClone: ApiList = Object.create(apiList);
            apiListClone.gitClone = newStatus;
            setApiList(apiListClone);
          } else {
            console.log('repo dont exist');
            setRepoStatus(false);
          }
        }
      } catch (error) {
        if (error.message === 'Network Error') {
          console.log('server not running');
          setServerExist(false);
        }
        setQuery({});
      }
    };

    checkServerDirExist();
  }, [query, apiList]);

  useEffect(() => {
    if (isMount) {
      parseUrl();
    }
  }, [isMount]);

  useEffect(() => {
    const fetchData = async (): Promise<Function> => {
      try {
        if (
          Object.keys(query).length > 0 &&
          apiList[api] &&
          apiList[api].requested === true
        ) {
          await axios.post(`/${api}`, query);
          const newStatus: ApiDetails = {
            api,
            status: true,
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
          status: false,
          requested: false,
        };
        const apiListClone: ApiList = Object.create(apiList);
        apiListClone[api] = newStatus;
        setApiList(apiListClone);
      }

      return (): void => {
        console.log('use effect clean up');
      };
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, query]);

  const setRequested = (): void => {
    const newStatus: ApiDetails = {
      api,
      status: null,
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
        <img
          src="assets/icons/settings.svg"
          alt=""
          className="options_icon"
          role="presentation"
          onClick={(): Promise<Tabs.Tab> => {
            return openWebPage('options.html');
          }}
        />
      </div>
      <p className="message">
        {serverExist
          ? 'Interact with git from browser ext. 🚀'
          : ' 🥺 Plz. start gitifyServer'}
      </p>
      <div className="container">
        <Button
          BtnTheme={serverExist ? 'green' : 'disabled'}
          BtnText=" git clone"
          BtnClickFxn={gitClone}
        >
          {apiList.gitClone.requested && apiList.gitClone.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitClone.status && apiList.gitClone.status === true ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitClone.status === false ? (
            <X
              style={{marginRight: '1rem'}}
              color="Red"
              onClick={(): void => console.log('gitClone err fxn')}
            />
          ) : null}
        </Button>
        <Button
          BtnTheme={repoStatus ? 'orange' : 'disabled'}
          BtnText="open in code"
          BtnClickFxn={openVsCode}
        >
          {apiList.openVSCode.requested &&
          apiList.openVSCode.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.openVSCode.status && apiList.openVSCode.status === true ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.openVSCode.status === false ? (
            <X style={{marginRight: '1rem'}} color="Red" />
          ) : null}
        </Button>

        <Button
          BtnTheme={repoStatus ? 'red' : 'disabled'}
          BtnText="git push"
          BtnClickFxn={gitPush}
        >
          {apiList.gitPush.requested && apiList.gitPush.requested === true ? (
            <Loader className="spin" style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitPush.requested === null ? (
            <ChevronDown
              style={{marginRight: '1rem'}}
              onClick={(): void => console.log('down click')}
            />
          ) : null}
          {apiList.gitPush.status && apiList.gitPush.status === true ? (
            <Check style={{marginRight: '1rem'}} />
          ) : null}
          {apiList.gitPush.status === false ? (
            <X style={{marginRight: '1rem'}} color="Red" />
          ) : null}
        </Button>
      </div>
    </section>
  );
};

export default Popup;
