import TcpSocket from 'react-native-tcp-socket';
import { Buffer } from 'buffer';

const message = Buffer.from(
  '1b740e1b21101b21201b4d001b61010a1b61001b61010a1b61001b2100868b2e20848992938f979186912030382f30352f323032352032323a31353a33320a1b21101b21201b4d001b6100809088878b8e91208f8090808282848a8880913a202333330a868b84908e8b868c88803a2031372f30342f323032350a9790803a2031373a35373a35360a9290808f8485883a2043320a9184908188928e908e913a204e49434b20432e0a1b21002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b21101b21201b4d001b61010a1b61001b61010a1b6100315820434146464520414d45524943414e4f0a20202d208b849290888e91200a20202d208b8482808a8e200a1b61010a1b6100315820455350524553534f0a1b61010a1b61001b21002d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d0a1b21101b21201b4d001b61010a1b61001b61010a1b61001b64041b64041d56001b401b2100',
  'hex'
);

export const printToHprt = (ip: string, port = 9100, buffer: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const message = Buffer.from(buffer, 'hex');
    const client = TcpSocket.createConnection({ host: ip, port }, () => {
      try {
        const success = client.write(message, undefined, (err) => {
          if (err) {
            console.error('Write failed:', err.message);
            client.destroy();
            return reject(err);
          } else {
            console.log('Write success');
            client.destroy(); // This will trigger 'close'
          }
        });

        if (!success) {
          const err = new Error('Write returned false (buffer full?)');
          console.error(err.message);
          client.destroy();
          return reject(err);
        }
      } catch (err: any) {
        console.error('Unexpected error during write:', err.message);
        client.destroy();
        return reject(err);
      }
    });

    client.on('error', (err) => {
      console.error('TCP Socket error:', err.message || err);
      reject(err);
    });

    client.on('close', () => {
      console.log('Connection is closed');
      resolve();
    });

    client.on('data', (data) => {
      console.log('Received from printer:', data.toString('hex'));
      // You can optionally resolve/reject based on data
    });
  });
};
