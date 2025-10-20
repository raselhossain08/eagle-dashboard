// Contracts API service
export const contractsApi = {
  getContracts: async () => {
    return Promise.resolve([]);
  },
  
  getContract: async (id: string) => {
    return Promise.resolve({});
  },
  
  createContract: async (data: any) => {
    return Promise.resolve({});
  },
  
  updateContract: async (id: string, data: any) => {
    return Promise.resolve({});
  },
  
  deleteContract: async (id: string) => {
    return Promise.resolve({});
  }
};

// Also export as contractsService for backward compatibility
export const contractsService = contractsApi;