import api from '@/lib/api';
import { IPublicModelConfigs } from '@/types/llmconfig';

export const modelConfigService = {
  getPublicModelConfigs: async (): Promise<IPublicModelConfigs> => {
    const response = await api.get('/model-configs/public');
    return response.data.data;
  },
};
