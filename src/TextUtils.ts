
// See http://unicode.org/versions/Unicode5.2.0/ch03.pdf
// 3.12 Hangul Syllable Decomposition
// Jamo codes: http://www.unicode.org/charts/PDF/U1100.pdf

const SBase = 0xAC00
const LBase = 0x1100
const VBase = 0x1161
const TBase = 0x11A7
const VCount = 21
const TCount = 28
const NCount = VCount * TCount


const decompose = (syllable: string) => {
    const S = syllable.charCodeAt(0)
    const SIndex = S - SBase
    const L = LBase + Math.floor(SIndex / NCount)  // Leading consonant
    const V = VBase + Math.floor((SIndex % NCount) / TCount)  // Vowel
    const T = TBase + SIndex % TCount  // Trailing consonant

    const result = (T === TBase) ?  [L, V] : [L, V, T]

    let resString = []
    for (let entry of result) {
        resString.push(String.fromCharCode(entry))
    }
    return resString
}

// from https://en.wikipedia.org/wiki/Hangul_Jamo_(Unicode_block)
const diphtongs = new Map<string, string[]>([
    ['ᅱ', ['ᅮ', 'ᅵ']],
    ['ᅰ', ['ᅮ', 'ᅦ']],
    ['ᅫ', ['ᅩ', 'ᅢ']],
    ['ᅪ', ['ᅩ', 'ᅡ']],
    ['ᅬ', ['ᅩ', 'ᅵ']],
    ['ᅯ', ['ᅮ', 'ᅥ']],
    ['ᅴ', ['ᅳ', 'ᅵ']]
])

const finalDoublePatchims = new Map<string, string[]>([
   /* ['ᄁ', ['ᄀ', 'ᄀ']],
    ['ᄄ', ['ᄃ', 'ᄃ']],
    ['ᄈ', ['ᄇ', 'ᄇ']],
    ['ᄊ', ['ᄉ', 'ᄉ']],
    ['ᄍ', ['ᄌ', 'ᄌ']],*/
    ['ᆩ', ['ᆨ', 'ᄀ']],
    ['ᆪ', ['ᆨ', 'ᄉ']],
    ['ᆬ', ['ᆫ', 'ᄌ']],
    ['ᆭ', ['ᆫ', 'ᄒ']],  //  	 	 	 	 	 	 	ᆷ 	ᆸ 	
    ['ᆰ', ['ᆯ', 'ᄀ']],
    ['ᆱ', ['ᆯ', 'ᄆ']],
    ['ᆲ', ['ᆯ', 'ᄇ']],
    ['ᆳ', ['ᆯ', 'ᄉ']],
    ['ᆴ', ['ᆯ', 'ᄐ']],
    ['ᆵ', ['ᆯ', 'ᄑ']],
    ['ᆶ', ['ᆯ', 'ᄒ']],
    ['ᆹ', ['ᆸ', 'ᄉ']],
    ['ᆻ', ['ᆺ', 'ᄉ']],  // 
])

const decomposeAllCases = (syllable: string) => {
    const normal = convertJamo(syllable[syllable.length-1])
    if (isSingleLetterInitial(normal))
        return [normal]
    
    const letters = decompose(normal)
    const vowel = diphtongs.get(letters[1])
    if(vowel) {
        const [first, second] = vowel
        letters[1] = first
        letters.splice(2, 0, second)
    }
    if(letters.length < 3)
        return letters

    const finals = finalDoublePatchims.get(letters[2])
    if(finals) {
        const [first, second] = finals
        letters[2] = first
        letters.splice(3, 0, second)
    }    
    return letters    
}

function arraysEqual(a: any[], b: any[]) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

function isJamoCompatible(syllable: string) {
    return 0x3130 <= syllable.charCodeAt(0) && syllable.charCodeAt(0) <= 0x318F
}

function isSingleLetterInitial(syllable: string) {
    return 0x1100 <= syllable.charCodeAt(0) && syllable.charCodeAt(0) <= 0x1112
}

function convertJamo(syllable: string): string {
    if(isJamoCompatible(syllable)) {
        const compatibleToInitial  = new Map<string, string>([
            ['ㄱ', 'ᄀ'],  
            ['ㄲ', 'ᄁ'],
            ['ㄴ', 'ᄂ'],
            ['ㄷ', 'ᄃ'],
            ['ㄸ', 'ᄄ'],
            ['ㄹ', 'ᄅ'],
            ['ㅁ', 'ᄆ'],
            ['ㅂ', 'ᄇ'],
            ['ㅃ', 'ᄈ'],
            ['ㅅ', 'ᄉ'],
            ['ㅆ', 'ᄊ'],
            ['ㅇ', 'ᄋ'],
            ['ㅈ', 'ᄌ'],
            ['ㅉ', 'ᄍ'],
            ['ㅊ', 'ᄎ'],
            ['ㅋ', 'ᄏ'],
            ['ㅌ', 'ᄐ'],
            ['ㅍ', 'ᄑ'],
            ['ㅎ', 'ᄒ']
        ])
        return compatibleToInitial.get(syllable) ?? syllable
    }
    return syllable
}

function getLastWordStartPos(text: string) {
   const match = /\S+\s*$/u.exec(text)
   return match !== null ? match.index : 0
}

enum CheckStatus {
    Ok,
    PartialMatch,
    Mismatch
}

interface CheckResult {
    status: CheckStatus
    toDelete: string
    toInsert: string
} 

const CheckKoreanText = (source: string, inputText: string, canContinueInput:boolean=true): CheckResult => {
    if (source === inputText)
        return {status: CheckStatus.Ok, toDelete: '', toInsert: ''}
    const lastWordIndex = getLastWordStartPos(inputText)
    const inputLastWord = inputText.substring(lastWordIndex)
    const sourceLastWord = source.substring(lastWordIndex, inputText.length)
    
    const mustBe = sourceLastWord.substring(0, inputLastWord.length)
    if (mustBe === inputLastWord || mustBe.length === 0)
        return {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}

    if (mustBe.substring(0, mustBe.length-1) === inputLastWord.substring(0, inputLastWord.length - 1))
    {
        const sourceLastCharDecomposed = decomposeAllCases(mustBe[mustBe.length-1])
        const currentLastCharDecomposed = decomposeAllCases(inputLastWord[inputLastWord.length-1])
        if(currentLastCharDecomposed.length > sourceLastCharDecomposed.length)
            if(source.length > inputText.length && canContinueInput){
                const borrowedChar = source[inputText.length]
                const extraChars = decomposeAllCases(borrowedChar)
                sourceLastCharDecomposed.push(...extraChars)
            }
            else
                return {status: CheckStatus.Mismatch, toDelete: inputLastWord, toInsert: mustBe}
        const commonLength = currentLastCharDecomposed.length
        if(arraysEqual(sourceLastCharDecomposed.slice(0, commonLength),
                       currentLastCharDecomposed.slice(0, commonLength)))
            return {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
    }
    return {status: CheckStatus.Mismatch, toDelete: inputLastWord, toInsert: mustBe}
}

export {CheckKoreanText, CheckStatus}
