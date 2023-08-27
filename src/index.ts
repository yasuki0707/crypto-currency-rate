import { verify } from '@modules/lineVerification';
import { func } from '@modules/scraping';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
exports.handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log('EVENT:', JSON.stringify(event, null, 2));

  // check LINE signature
  verify(event);

  const eventData = event?.body ? JSON.parse(event.body) : null;
  await func(eventData);
};
