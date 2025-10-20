// Templates API service
export const templatesApi = {
  getTemplates: async () => {
    return Promise.resolve([]);
  },
  
  getTemplate: async (id: string) => {
    return Promise.resolve({});
  },
  
  createTemplate: async (data: any) => {
    return Promise.resolve({});
  },
  
  updateTemplate: async (id: string, data: any) => {
    return Promise.resolve({});
  },
  
  deleteTemplate: async (id: string) => {
    return Promise.resolve({});
  }
};

// Also export as templatesService for backward compatibility
export const templatesService = templatesApi;