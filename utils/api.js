// utils/api.js

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://alnada.eprime.app/api/';

export const apiGet = async (endpoint) => {
    console.log(process.env.NEXT_PUBLIC_API_BASE_URL)
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-TOKEN': 'RvpA6SuRQyydHIeZkyxbYViBmj5jVkODaTvZc24dbjE9XoKpxSM3KQy15zowmF0xaMkHcriCbt4abuMtvms54wtmWoXxESGxcvLeKvIM9ZFLblzzogMds9E8z3toxCYlE9kws9hqOAFbQo0wjHLESaX2FHcufLMlXhjx'
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Usage in component:
// import { apiGet } from '@/utils/api';
// 
// const fetchData = async () => {
//   const data = await apiGet('/users');
//   console.log(data);
// };