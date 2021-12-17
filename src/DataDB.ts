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

interface RowData {
    id: number,
    //score:
    sentence1: string,
    sentence2: string
}

interface DeckData extends DeckInfo {
    rows: RowData[]
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
        let remainder = txtChunk.substr(startIndex);
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
      yield txtChunk.substr(startIndex);
    }
  }

     
  async function getTextDeck(root_url: string, deckInfo: DeckJsonRecord) {
      //
    const url = `${root_url}/deck/${deckInfo.fileName}`
    const rows = []
    let index = 0
    for await (let line of makeTextFileLineIterator(url)) {
      if (line.length === 0 )
        continue
      const parts = line.split('\t')
      const sentenceId = deckInfo.id * 10000 + index //getWordId(deckDesc.Id, index)
      const newRecord = {
        id: sentenceId,
      //  score: 0, // getWordScore(wordId)
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

      rows.push(newRecord)
      ++index
    }
    return {
      id: deckInfo.id,
      name: deckInfo.name,
      description: deckInfo.description,
      language: deckInfo.language,
      rows: rows
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
export type { DeckData, RowData }
