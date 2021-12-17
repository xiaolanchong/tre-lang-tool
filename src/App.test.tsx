import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import {CheckKoreanText, CheckStatus} from './TextUtils'

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Language 1/i);
  expect(linkElement).toBeInTheDocument();
});

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
});

test('Korean: correct prefix', () => {
  expect(CheckKoreanText('나는', 'ㄴ')).toStrictEqual(
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