import TextDecks from './deck/TextDecks.json' 

interface DeckJsonRecord {
    id : number,
    name: string,
    description: string,
    language: string,
    fileName: string
}

interface DeckInfo {
  id : number,
  name: string,
  description: string,
  language: string
}

interface SectionInfo {
  description: string
  rows: RowData[]
}

interface RowData {
  id: number,
  //score:
  sentence1: string,
  sentence2: string
}

interface DeckData extends DeckInfo {
    sections: SectionInfo[]
}

async function* makeTextFileLineIterator(fileURL: string) {
  const utf8Decoder = new TextDecoder('utf-8');
  const response = await fetch(fileURL);
  if(response === null)
      return null
  const body = response.body
  if(body === null)
      return null
  const reader = body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  let txtChunk = chunk ? utf8Decoder.decode(chunk) : '';

  const re = /\n|\r|\r\n/gm;
  let startIndex = 0;

  for (;;) {
    let result = re.exec(txtChunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = txtChunk.substring(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      txtChunk = remainder + (chunk ? utf8Decoder.decode(chunk) : '');
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield txtChunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < txtChunk.length) {
    // last line didn't end in a newline char
    yield txtChunk.substring(startIndex);
  }
}

type TextGetter =  AsyncGenerator<string, null|undefined>

async function getTextDeckInternal(textGetter: TextGetter) : Promise<SectionInfo[]> {
  const sections: SectionInfo[] = []
  let lastSection: SectionInfo | null = null
  let index = 0

  for await (let line of textGetter) {
    if (line.length === 0 )
      continue
    let match = null
    if ((match = line.match(/\s*#\s*(.+)/)) != null) {
      if(lastSection !== null)
        sections.push(lastSection)
      lastSection = {description: match[1], rows: []}
      continue
    } else if (lastSection === null)
      lastSection = {description: '', rows: []}
    const parts = line.split('\t')
    const sentenceId = index
    const newRecord = {
      id: sentenceId,
      sentence1: '',
      sentence2: ''
    } as RowData

    switch (parts.length) {
      case 1:
        newRecord.sentence1 = parts[0]
        break
      case 2:
        newRecord.sentence1 = parts[0]
        newRecord.sentence2 = parts[1]
        break
  /*    case 3:
        newRecord.word = parts[0]
        newRecord.extra = parts[1] ? parts[1]: undefined
        newRecord.meaning = parts[2]
        break */
      default:
        break
    }
    lastSection.rows.push(newRecord)
  }

  if(lastSection !== null)
    sections.push(lastSection)

  return sections
}
   
async function getTextDeck(root_url: string, deckInfo: DeckJsonRecord) {
  const url = `${root_url}/deck/${deckInfo.fileName}`
  const textGetter = makeTextFileLineIterator(url)
  const sections = await getTextDeckInternal(textGetter)

  return {
    id: deckInfo.id,
    name: deckInfo.name,
    description: deckInfo.description,
    language: deckInfo.language,
    sections: sections
  } as DeckData
}

class DataDB {
    decks: DeckJsonRecord[]

    constructor() {
        this.decks = TextDecks
    }

    getAllDecks() : DeckInfo[] {
        return this.decks.map((value: DeckJsonRecord, index: number) => {
            return { 
                id: value.id, 
                name: value.name,
                description: value.description,
                language: value.language
             } as DeckInfo
        })
    }

    async getDeck(root_url: string, deckId: number): Promise<DeckData|null> {
        const found = this.decks.find((value: DeckJsonRecord) => value.id === deckId)
        if (found !== undefined) {
            return getTextDeck(root_url, found)
        }
        return null
    }
}

const dataDb = new DataDB()

export { dataDb }
export type { DeckData, RowData, SectionInfo, DeckInfo }
