import { api } from './api';
import type { DashboardResponse, Environment } from '../types/dashboard.types';

export const dashboardApi = {
    fetchDashboardData: async (env: Environment): Promise<DashboardResponse> => {
       const  env1="da3dd39a-d430-47dd-a912-2e37e2580c6c"
       console.log(env);
        const response = await api.get(`/Root/${env1}`);
        return response as DashboardResponse;
    },
};
