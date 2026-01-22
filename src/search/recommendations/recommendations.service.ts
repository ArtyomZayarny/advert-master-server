import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecommendationsService {
  async getRecommendations(category: string, forId: number): Promise<any[]> {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    try {
      // Call adverts-service for recommendations
      const response = await axios.get(`${advertsServiceUrl}/recom/post_recommend`, {
        params: { category, forId },
        timeout: 5000,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  async markView(adId: number): Promise<void> {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    try {
      await axios.post(
        `${advertsServiceUrl}/recom/view`,
        { id: adId },
        {
          timeout: 5000,
        },
      );
    } catch (error) {
      console.error('Error marking view:', error);
    }
  }
}
