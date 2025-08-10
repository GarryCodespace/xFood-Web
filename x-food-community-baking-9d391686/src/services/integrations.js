import { apiService } from './api';
import { AUTH_CONFIG } from '@/config/auth';

// File upload service
export const UploadFile = {
  upload: async (file, type = 'image') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

                   const response = await fetch(`${AUTH_CONFIG.API.BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
};

// Email service
export const SendEmail = {
  send: async (emailData) => {
    try {
      return await apiService.post('/send-email', emailData);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }
};

// Placeholder for other integrations that were in base44
export const InvokeLLM = {
  invoke: async (prompt) => {
    // This would integrate with an LLM service
    console.log('LLM integration not implemented yet');
    return { response: 'LLM integration coming soon' };
  }
};

export const GenerateImage = {
  generate: async (prompt) => {
    // This would integrate with an image generation service
    console.log('Image generation not implemented yet');
    return { url: '/placeholder-image.jpg' };
  }
};

export const ExtractDataFromUploadedFile = {
  extract: async (fileUrl) => {
    // This would extract data from uploaded files
    console.log('Data extraction not implemented yet');
    return { data: 'Data extraction coming soon' };
  }
};
