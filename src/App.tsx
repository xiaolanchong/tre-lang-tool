import {SetStateAction, useState} from 'react';
//import logo from './logo.svg';
import './App.css';
import './BilangTrial'
import { BilangTrialPage } from './BilangTrial';
import { PassageList } from './PassageList';
import { dataDb } from './DataDB';

enum AppMode {
  PassageList,
  Passage
}

interface AppState {
  mode: AppMode,
  currentDeckId: number | null
}

interface PassageListPageProps {
  setAppState:React.Dispatch<SetStateAction<AppState>>
}

interface PassagePageProps {
  setAppState:React.Dispatch<SetStateAction<AppState>>
  currentState: AppState
}

const PassageListPage = ({setAppState}: PassageListPageProps) => {
  document.documentElement.lang = 'ru'
  const onDeckSelected = (deckId: number) => {  
    setAppState({mode: AppMode.Passage, currentDeckId: deckId})
  }
  const deckInfos = dataDb.getAllDecks()
  return <div className='container-md'>
            <h1>Список текстов</h1>
            <PassageList deckInfos={deckInfos} onDeckSelected={onDeckSelected} ></PassageList>
          </div>
}

const PassagePage = ({currentState, setAppState}: PassagePageProps) => {
  return <div className='container-md'>
                <button className='btn btn-link'
                  onClick={ ()=> { setAppState({mode: AppMode.PassageList, currentDeckId: null})} }>
                  ← На список текстов
                </button>
                <BilangTrialPage deckId={currentState.currentDeckId ?? -1} />
          </div>
}

const App = () => {
  const [appState, setAppState] = useState<AppState>(
    {mode: AppMode.PassageList, currentDeckId: null}
    )

  switch(appState.mode)
  {
    case AppMode.PassageList:
      return <PassageListPage setAppState={setAppState} />
    case AppMode.Passage:
      return <PassagePage currentState={appState} setAppState={setAppState} />
  }
}

export default App;
