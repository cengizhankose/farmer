// Mock Leather Provider for Development/Demo
// Bu dosyayı sadece demo amaçlı kullanın

if (typeof window !== 'undefined' && !window.LeatherProvider) {
  console.log('🧪 Mock Leather Provider activated for demo');
  
  window.LeatherProvider = {
    request: async (method, params) => {
      console.log('Mock Leather Request:', method, params);
      
      switch (method) {
        case 'getAddresses':
          // Simulate user approval delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            addresses: {
              stx: [{
                address: 'ST2EXAMPLE8ADDRESSFOR9TESTING0PURPOSES',
                publicKey: 'mock-public-key'
              }],
              btc: [{
                address: 'tb1qexamplebitcoinaddressfortesting',
                publicKey: 'mock-btc-public-key'
              }]
            }
          };
          
        case 'stx_transferStx':
          await new Promise(resolve => setTimeout(resolve, 2000));
          return {
            txid: '0xMOCKTRANSACTIONIDFORTESTING123456789'
          };
          
        case 'stx_callContract':
          await new Promise(resolve => setTimeout(resolve, 2000));
          return {
            txid: '0xMOCKCONTRACTCALLIDFORTESTING123456789'
          };
          
        case 'stx_signMessage':
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            signature: 'mock-signature-for-testing'
          };
          
        default:
          throw new Error(`Mock: Unsupported method ${method}`);
      }
    }
  };
  
  // Mock installation detection
  console.log('✅ Mock Leather Provider ready');
}