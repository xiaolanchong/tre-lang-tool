
import './MatchingInput.css'
import {useState} from 'react'
import { usePopper } from 'react-popper';
import { CheckKoreanText, CheckStatus } from './TextUtils';

interface CheckingResultProps {
    source: string;
    currentText: string;
}

const CheckingResult=( {source, currentText}: CheckingResultProps) => {
    const checkResult = CheckKoreanText(source, currentText)
    if (checkResult.status === CheckStatus.Ok)
        return <span className='check_ok'>Finished</span>
    else if (checkResult.status === CheckStatus.PartialMatch)
        return <span className='check_ok'></span>
    else
        return <span className='check_failure'>
                    <del className='m-1 check_failure_text'>{checkResult.toDelete}</del>
                    {checkResult.toInsert}
                </span>
}

interface MatchingInputProps {
    source: string;
}

const MatchingInput = ({source}: MatchingInputProps) => {
    const [currentText, setText] = useState('')

    //const [visible, setVisibility] = useState(false)
    const [tooltipText, setTooltipText] = useState(<></>)
    const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null);
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
    const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
    const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
      modifiers: [
            { name: 'arrow', options: { element: arrowElement} }, 
            { name: 'hide' },
        ],
    });
 

    return (
        <>
            <input  value={currentText}
                    style={{width:'100%'}}
                    onChange={  e => {setText(e.target.value); 
                                setTooltipText(<CheckingResult source={source}
                                                currentText={e.target.value} />)}}
                    ref={setReferenceElement} >
            </input>
              <div id='tooltip' ref={setPopperElement}
                    style={styles.popper} 
                    {...attributes.popper}>
                    {tooltipText}
                <div id='tooltip_arrow' ref={setArrowElement} style={styles.arrow} />
              </div>
        </>
    )
}

export {MatchingInput}
