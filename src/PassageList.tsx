//import {useState} from 'react'
import {DeckInfo} from './DataDB'

interface PassageListProps {
    deckInfos: DeckInfo[]
    onDeckSelected: (deckId: number) => void
}

const Passages = ({deckInfos, onDeckSelected}: PassageListProps) => {
    return  <> 
                {deckInfos.map((value: DeckInfo, index) => {
                            return <tr key={value.id}>
                                    <td><button className='btn btn-link' 
                                                onClick={() => { onDeckSelected(value.id) }}>
                                            {value.name}
                                        </button>
                                    </td>
                                    <td>{value.description}</td>
                                    <td>{value.language}</td>
                                </tr>
                    })
                }
            </>
}


const PassageList = ( {deckInfos, onDeckSelected}: PassageListProps) => {
    return <table>
        <thead>
            <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Язык</th>
            </tr>
        </thead>
        <tbody>
            <Passages deckInfos={deckInfos} onDeckSelected={onDeckSelected} />
        </tbody>
    </table>
}

export {PassageList}