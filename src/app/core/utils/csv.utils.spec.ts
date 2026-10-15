import { toCsv } from './csv.utils';

describe('toCsv', () => {
  it('escapes fields containing quotes, commas, and line breaks', () => {
    expect(toCsv(['Name', 'Notes'], [['Amina Shah', 'Says "hello", then leaves\nfor lunch']]))
      .toBe('Name,Notes\r\nAmina Shah,"Says ""hello"", then leaves\nfor lunch"');
  });
});
