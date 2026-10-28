import EfiPay from 'sdk-node-apis-efi';
import path from 'path';

const options = {
  sandbox: process.env.EFI_SANDBOX === 'true',
  client_id: process.env.EFI_CLIENT_ID || '',
  client_secret: process.env.EFI_CLIENT_SECRET || '',
  certificate: path.resolve(process.env.EFI_CERT_PATH || './certs/producao-562088-OmniCaixa.p12'),
};

const efipay = new EfiPay(options);

export default efipay;