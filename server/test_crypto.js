import { decrypt } from './utils/cryptoUtils.js';

const process_env = {
  MASTER_KEY: 'daf2bffb3d41b442270bbec78a86ca7b46c3f533db7005a8335a9c95551daffb',
  UROPAY_API_KEY: 'enc:d952471fac1b2b834bd354fafe9b2458:5cdded862d03103623622e8366e8c8d719462f7168ac7156ff76187045965693',
  UROPAY_SECRET: 'enc:0fbe453bc1f43f82b2cceacd1410d1a4:f23164b7936e998dd4cceb6a1c16777d84c6484602b3b8cef666cd0eeffaeebeb3abd27a48d8ece089c06f793dee77df29dac2ad388e078bf323fa0db07ba317',
  UROPAY_VPA: 'enc:ee3f66ad66adb49dc08007b8ae3f5ffa:b74e3b5794538f5741c4a343016a724aaa95a277f3a74281d4ab23b8fc83ee5b'
};

try {
  console.log('Testing Decryption...');
  const apiKey = decrypt(process_env.UROPAY_API_KEY, process_env.MASTER_KEY);
  const secret = decrypt(process_env.UROPAY_SECRET, process_env.MASTER_KEY);
  const vpa = decrypt(process_env.UROPAY_VPA, process_env.MASTER_KEY);
  
  console.log('API Key decrypted:', apiKey ? 'SUCCESS' : 'FAIL');
  console.log('Secret decrypted:', secret ? 'SUCCESS' : 'FAIL');
  console.log('VPA decrypted:', vpa ? 'SUCCESS' : 'FAIL');
  
} catch (error) {
  console.error('Decryption Test Failed:', error);
}
