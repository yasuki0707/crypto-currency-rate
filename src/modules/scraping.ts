import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { lineSendMessage } from '@modules/lineMessagingApi';
import fetch from 'node-fetch';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const func = async (eventData: any) => {
  const currencyRate = await getCurrencyRate();
  const replyToken = eventData?.events[0].replyToken ?? null;

  await lineSendMessage(currencyRate, replyToken);
};

// 外部のコインレート取得APIからのレスポンスの型
type TGMOApiResponse = {
  ask: string;
  bid: string;
  high: string;
  last: string;
  low: string;
  symbol: string;
  timestamp: string;
  volume: string;
};

// 通知する内容の詰まったオブジェクト
export type TCryptoCoin = {
  name: string;
  rate: number;
  dif: number;
  pct: number;
};

// DynamoDBから取得する現在コイン情報
type TPrevCoinRate = {
  [key: string]: number;
};

const getCurrencyRate = async () => {
  // TODO: この関数の中で以下のように二つのサブルーチンを作る
  // この関数(getCurrencyRateから変更する)
  //   targetCoinsの定義(BTC, ETh, BCH, XRP)と、以下二つのサブルーチンからデータを取得しテキストとして繋げる
  //    |_getCurrencyRate...最新レートの取得->GMOコインAPI
  //    |_getPreviousRate...前回レートの取得->DynamoDB
  // TODO: 外部APIはmodules/interfaces/apis/などを作ってそこに入れる
  // modules/interfaces/apis/line/messagingapi
  // modules/interfaces/apis/aws/dynamodb
  // modules/interfaces/apis/aws/s3 など

  const BASE_URL = 'https://api.coin.z.com';
  const PATH = 'public/v1/ticker';
  const URL = `${BASE_URL}/${PATH}`;
  const targetCoins = ['BTC', 'ETH', 'BCH', 'XRP'];

  const response = await fetch(URL);

  const json = await response.json();

  const allCoinsInfo: TGMOApiResponse[] = json.data;

  const targetCoinsInfo = allCoinsInfo.filter((c) =>
    targetCoins.includes(c.symbol)
  );

  const previousRate = await getPreviousRate(targetCoins);

  const cryptoCoins: TCryptoCoin[] = targetCoinsInfo.map((c) => {
    const cur = Number(c.last);
    const pre = previousRate[c.symbol];
    const dif = cur - pre;
    return {
      name: c.symbol,
      rate: cur,
      dif: Math.round(dif),
      pct: calcPercentage(cur, pre, 1)
    };
  });

  await updateCurrencyRate(cryptoCoins);

  return convertToText(cryptoCoins);
};

export const calcPercentage = (
  cur: number,
  pre: number,
  decimal: number
): number => {
  const digits = 10 ** decimal;
  return Math.round((((cur - pre) * 100) / pre) * digits) / digits;
};

export const convertToText = (rates: TCryptoCoin[]): string => {
  return rates
    .map((r) => {
      const sign = r.dif > 0 ? '+' : '';
      return `${r.name}: ${r.rate} (${sign}${r.dif}, ${sign}${r.pct}%)`;
    })
    .join('\n');
};

const f = (targetCoins: string[]) => {
  return targetCoins.map((x) => {
    return { coin_id: { S: x } };
  });
};

const getPreviousRate = async (
  targetCoins: string[]
): Promise<TPrevCoinRate> => {
  const client = new DynamoDB({ region: 'ap-northeast-1' });
  const params = {
    RequestItems: {
      crypto_coins: {
        Keys: f(targetCoins)
      }
    },
    ProjectionExpression: 'coin_id, current_price'
  };
  const data = await client.batchGetItem(params);
  const coins: TPrevCoinRate = {};
  if (data.Responses) {
    data.Responses.crypto_coins.forEach((x) => {
      Object.values(x)
        .filter((y) => Object.keys(y)[0] === 'N')
        .forEach((y) => {
          const coin = Object.values(x.coin_id)[0];
          const price = Number(y['N']);
          coins[coin] = price;
        });
    });
  }
  return coins;
};

const updateCurrencyRate = async (coinInfo: TCryptoCoin[]) => {
  const client = new DynamoDB({ region: 'ap-northeast-1' });

  await Promise.all(
    coinInfo.map(async (c) => {
      const params = {
        Key: {
          coin_id: { S: c.name }
        },
        UpdateExpression: 'SET #current_price_1 = :current_price_1',
        ExpressionAttributeNames: {
          '#current_price_1': 'current_price'
        },
        ExpressionAttributeValues: {
          ':current_price_1': { N: String(c.rate) }
        },
        TableName: 'crypto_coins'
      };
      await client.updateItem(params);
    })
  );
};
