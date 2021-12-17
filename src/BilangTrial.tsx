import { useState, useEffect } from "react"
import { dataDb, DeckData, RowData, SectionInfo } from "./DataDB"
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
  section: SectionInfo
}

const Section = ({currentMode, onModeChange, section} : SectionProps) => {
  const rows = section.rows.map((value: RowData, index) => {
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
              Перевод исх. текста</button>
        <button className={'btn btn-primary m-2 ' + (currentMode===TrialMode.Review? "disabled" : "")}
            onClick={ ()=> onModeChange(TrialMode.Review)} >
              Проверка перевода</button>
        <button className={'btn btn-primary m-2 ' + (currentMode===TrialMode.Enter ? "disabled" : "")}
        onClick={ ()=> onModeChange(TrialMode.Enter)} >
              Ввод исх.текста</button>
      </div>
      <table className="table border thead-dark">
        <caption>{section.description}</caption>
        <thead>
          <tr>
            <th>Исходный текст</th>
            <th>Перевод</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>)
}

interface BilingualTrialProps {
  deckId: number
}

const Page = ({deckId}: BilingualTrialProps) => {
  const nullDeck = {sections:[], id: 0, name: '', language: '', description: ''} as DeckData
  const [deck, setDeck] = useState(nullDeck);
  const [mode, setMode] = useState(TrialMode.Translate);

  document.documentElement.lang = deck.language
  useEffect(() => {
    if(deck?.name === nullDeck.name){
       deckGetter(deckId);
    }
 });

 const deckGetter = async (deckId: number) => {
    const deckData = await dataDb.getDeck(process.env.PUBLIC_URL, deckId)
    if (deckData !== null)
      setDeck(deckData);
 }
 
 if (deck === undefined)
    return (<><h1 className='text-center'>Не такой колоды</h1></>)
 
  document.documentElement.lang = deck.language
  return (
    <>   
        <Header title={deck.name}/>
        {
          deck.sections.map((value: SectionInfo, index: number) => {
            return <Section currentMode={mode} onModeChange={setMode} section={value} key={index}/>
          })
        }
        
    </>
  )
}

export {Page as BilangTrialPage}