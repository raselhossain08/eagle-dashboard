// Signatures API service
export const signaturesApi = {
  getSignatures: async () => {
    return Promise.resolve([]);
  },
  
  getSignature: async (id: string) => {
    return Promise.resolve({});
  },
  
  createSignature: async (data: any) => {
    return Promise.resolve({});
  },
  
  updateSignature: async (id: string, data: any) => {
    return Promise.resolve({});
  },
  
  deleteSignature: async (id: string) => {
    return Promise.resolve({});
  }
};

// Also export as signaturesService for backward compatibility
export const signaturesService = signaturesApi;