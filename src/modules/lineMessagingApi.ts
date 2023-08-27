import { Client } from '@line/bot-sdk';
import fetch from 'node-fetch';

const CHANNEL_SECRET = process.env.CHANNEL_SECRET as string;
const CHANNEL_ID = process.env.CHANNEL_ID as string;
const API_URL = 'https://api.line.me/v2/oauth/accessToken';
const PERSONAL_UUID = process.env.PERSONAL_UUID as string;

export const lineSendMessage = async (
  message: string,
  replyToken: string
): Promise<void> => {
  const accessToken = await getAccessToken();

  const client = new Client({
    channelAccessToken: accessToken
  });

  // when called from lamnda-local, replyMessage would be failed, should be avoided
  // if (process.env.funcFile !== undefined) {
  if (!replyToken) {
    const response = await client.pushMessage(PERSONAL_UUID, {
      type: 'text',
      text: message
    });
    console.log('push message', response);
  } else {
    const response = await client.replyMessage(replyToken, {
      type: 'text',
      text: message
    });
    console.log('reply message', response);
  }
};

const getAccessToken = async (): Promise<string> => {
  // const params = {
  //   grant_type: 'client_credentials',
  //   client_id: CHANNEL_ID,
  //   client_secret: CHANNEL_SECRET,
  // };

  // const body = Object.keys(params)
  //   .map((k) => `${k}=${params[k]}`)
  //   .join('&');

  const body =
    'grant_type=client_credentials' +
    '&client_id=' +
    CHANNEL_ID +
    '&client_secret=' +
    CHANNEL_SECRET;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  };

  // TODO:use async/await
  // なぜか一回目の実行ではここに入る前に終了してしまい、二回目の実行で前のギャグが送信されてしまう、時間差。。？
  const response = await fetch(API_URL, options);
  const json = await response.json();
  return json.access_token;
};
