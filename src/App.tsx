import {useState} from 'react';
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

const App = () => {
  const [appState, setAppState] = useState<AppState>(
    {mode: AppMode.PassageList, currentDeckId: null}
    )

  switch(appState.mode)
  {
    case AppMode.PassageList:
      document.documentElement.lang = 'ru'
      const onDeckSelected = (deckId: number) => {  
        setAppState({mode: AppMode.Passage, currentDeckId: deckId})
      }
      const deckInfos = dataDb.getAllDecks()
      return <div className='container-md'>
                <PassageList deckInfos={deckInfos} onDeckSelected={onDeckSelected} ></PassageList>
              </div>
    case AppMode.Passage:
      return <div className='container-md'>
                <button className='btn btn-link'
                  onClick={ ()=> { setAppState({mode: AppMode.PassageList, currentDeckId: null})} }>
                  ← На список текстов
                </button>
                <BilangTrialPage deckId={appState.currentDeckId ?? -1} />
              </div>
  }
}

export default App;
