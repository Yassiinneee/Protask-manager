import axios from 'axios';
import { getAuthHeaders } from './auth';

export const generateTaskDescriptionAPI = async ({
  title,
  currentDescription = '',
  category = 'General',
  priority = 'Medium',
  tone = 'actionable',
  additionalContext = '',
}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      '/api/ai/generate-description',
      {
        title,
        currentDescription,
        category,
        priority,
        tone,
        additionalContext,
      },
      headers
    );
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const refineTaskDescriptionAPI = async ({
  title = 'Task',
  description,
  action = 'expand',
}) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      '/api/ai/refine-description',
      {
        title,
        description,
        action,
      },
      headers
    );
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      return error.response.data;
    }
    throw error;
  }
};
