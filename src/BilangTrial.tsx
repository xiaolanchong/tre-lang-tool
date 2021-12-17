import { useState, useEffect } from "react"
//import queryString from 'query-string';
import { dataDb, DeckData, RowData } from "./DataDB"
import { MatchingInput } from "./MatchingInput"

enum TrialMode {
  Translate,
  Review,
  Enter
}

interface HeaderProps {
  title: string
}

const Header =({title}: HeaderProps) => 
<>
  <h1>{title}</h1>
</>

interface RowProps {
  currentMode: TrialMode;
  textInLanguage1: string;
  textInLanguage2: string;
}

const Row = ( {currentMode, textInLanguage1, textInLanguage2}: RowProps) => {
  switch(currentMode)
  {
    case TrialMode.Translate: 
      const text2 = '\u00A0'.repeat(7)
      return <tr>
              <td>{textInLanguage1}</td>
              <td>{text2}</td>
            </tr>
    case TrialMode.Review:
      return <tr>
              <td>{textInLanguage1}</td>
              <td>{textInLanguage2}</td>
            </tr>
    case TrialMode.Enter:
      return <tr>
              <td width='50%'><MatchingInput source={textInLanguage1}/></td>
              <td>{textInLanguage2}</td>
            </tr>
    default:
      return <></>
  }

}

interface SectionProps {
  currentMode: TrialMode;
  onModeChange: (mode: TrialMode) => void;
  deck: DeckData
}

const Section = ({currentMode, onModeChange, deck} : SectionProps) => {
  const rows = deck.rows.map((value: RowData, index) => {
    return <Row  currentMode={currentMode}
                 textInLanguage1={value.sentence1}
                 textInLanguage2={value.sentence2}
                 key={index}/>
  }) 

  return (
    <>
      <div>
        <button className={'btn btn-primary m-2 ' + (currentMode===TrialMode.Translate ? "disabled" : "")}
            onClick={ ()=> onModeChange(TrialMode.Translate)} >
              Translate</button>
        <button className={'btn btn-primary m-2 ' + (currentMode===TrialMode.Review? "disabled" : "")}
            onClick={ ()=> onModeChange(TrialMode.Review)} >
              Review</button>
        <button className={'btn btn-primary m-2 ' + (currentMode===TrialMode.Enter ? "disabled" : "")}
        onClick={ ()=> onModeChange(TrialMode.Enter)} >
              Enter</button>
      </div>
      <table className="table border thead-dark">
        <caption>Chapter 1</caption>
        <thead>
          <tr><th>Language 1</th><th>Language 2</th></tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>)
}

const Page = (props: any) => {
  const nullDeck = {rows:[], id: 0, name: '', language: '', description: ''} as DeckData
  const [deck, setDeck] = useState(nullDeck);
  const [mode, setMode] = useState(TrialMode.Translate);

  useEffect(() => {
    if(deck?.name === nullDeck.name){
       deckGetter();
    }
 });
 
 /*
 const urlParams = queryString.parse(props.location.search);
 if (urlParams.id === undefined) {
    //return null;
 } else {

 }
 */
/*
 const deckId = urlParams.id;
 */
 const deckGetter = async () => {
    const myDeckId = 1000

    const deckData = await dataDb.getDeck(process.env.PUBLIC_URL, myDeckId)
    if (deckData !== null)
      setDeck(deckData);
 }
 
 if (deck === undefined)
    return (<><h1 className='text-center'>Не такой колоды</h1></>)
 
 document.documentElement.lang = deck.language

  return (
    <>
      <div className='container-md'>
        <Header title={deck.name}/>
        <Section currentMode={mode} onModeChange={setMode} deck={deck}/>
      </div>
    </>
  )
}

export {Page as BilangTrialPage}