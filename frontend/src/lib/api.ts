import axios from 'axios';
import type { PatternsResponse, ReportsResponse, ScanResult } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:8000/api';

export const scanRepository = async (url: string, is_local: boolean = false): Promise<ScanResult> => {
    try {
        const response = await axios.post<ScanResult>(`${API_BASE_URL}/scan`, { url, is_local });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getReports = async (): Promise<ReportsResponse> => {
    try {
        const response = await axios.get<ReportsResponse>(`${API_BASE_URL}/reports`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getPatterns = async (): Promise<PatternsResponse> => {
    try {
        const response = await axios.get<PatternsResponse>(`${API_BASE_URL}/patterns`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const resetAuditHistory = async (): Promise<{ status: string; cleared_entries: number }> => {
    try {
        const response = await axios.post<{ status: string; cleared_entries: number }>(`${API_BASE_URL}/history/reset`);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};
