import { isObjectEmpty } from '@utils/object';
import { createHmac } from 'crypto';

const CHANNEL_SECRET = process.env.CHANNEL_SECRET as string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const verify = (event: any): void => {
  if (isObjectEmpty(event)) {
    console.log('skip signature validation as event object is empty');
    return;
  }
  if (event.mode !== undefined && event.mode == 'test') {
    console.log('skip signature validation as this is test');
    return;
  }
  if (event.source === 'aws.events') {
    console.log(
      'skip signature validation as this is called from CloudWatch Events'
    );
    return;
  }

  const hash = createHmac('sha256', CHANNEL_SECRET)
    .update(event.body)
    .digest('base64');

  const signature = (event.headers || {})['x-line-signature'];

  if (hash !== signature) {
    throw new Error('signature verification:NG, not from LINE platform');
  }
  console.log('signature verification:OK');
};
