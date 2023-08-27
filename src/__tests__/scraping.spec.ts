import { calcPercentage, convertToText, TCryptoCoin } from '@modules/scraping';

describe('this is first test by jest', (): void => {
  test('should convert array to designated text.', (): void => {
    const a: TCryptoCoin[] = [
      {
        name: 'MONA',
        rate: 123,
        dif: 2,
        pct: 0.2
      }
    ];
    const response = convertToText(a);
    const expected = 'MONA: 123 (+2, +0.2%)';
    expect(response).toBe(expected);
  });
  test('should calculate percentage 1.', (): void => {
    const currentPrice = 110;
    const previousPrice = 100;
    const response = calcPercentage(currentPrice, previousPrice, 1);
    const expected = 10.0;
    expect(response).toBe(expected);
  });
  test('should calculate percentage 2.', (): void => {
    const currentPrice = 200;
    const previousPrice = 250;
    const response = calcPercentage(currentPrice, previousPrice, 1);
    // console.log(calcPercentage(currentPrice, previousPrice, 2));
    const expected = -20;
    expect(response).toBe(expected);
  });
  test('should calculate percentage 3.', (): void => {
    const currentPrice = 123;
    const previousPrice = 111;
    const response = calcPercentage(currentPrice, previousPrice, 2);
    const expected = 10.81;
    expect(response).toBe(expected);
  });
});
