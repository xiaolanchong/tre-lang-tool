import {CheckKoreanText, CheckStatus} from './TextUtils'

test('Korean: exact matching', () => {
  expect(CheckKoreanText('나는', '나는')).toStrictEqual(
    {status: CheckStatus.Ok, toDelete: '', toInsert: ''});
});

test('Korean: exact jamo prefix', () => {
  expect(CheckKoreanText('나는', '나')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  );
});

test('Korean: incorrect prefix', () => {
  expect(CheckKoreanText('나는', 'aaa')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: 'aaa', toInsert: '나는'}
  );

  expect(CheckKoreanText('희', '히')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: '히', toInsert: '희'}
  );

  expect(CheckKoreanText('10년이나', '10년 ')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: '10년 ', toInsert: '10년이'}
  );
});

test('Korean: correct prefix', () => {
  expect(CheckKoreanText('나는', 'ㄴ')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  );

  expect(CheckKoreanText('의', '으')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  ); 
  
  expect(CheckKoreanText('희', '흐')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  );

  expect(CheckKoreanText('100', '10')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  );
});

test('Korean: last incorrect prefix', () => {
  expect(CheckKoreanText('나는 낯선', '나는 낯대')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: '낯대', toInsert: '낯선'}
  );
});

test('Korean: last prefix longer than expected', () => {
  expect(CheckKoreanText('나는 낯선', '나는 낯대좋물')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: '낯대좋물', toInsert: '낯선'}
  );
  expect(CheckKoreanText('결국은 그런 운명 ', '결국은 그')).toStrictEqual(
    {status: CheckStatus.PartialMatch, toDelete: '', toInsert: ''}
  );
  expect(CheckKoreanText('결국은 그런 운명 ', '결국은 런')).toStrictEqual(
    {status: CheckStatus.Mismatch, toDelete: '런', toInsert: '그'}
    );
});