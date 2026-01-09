import axiosInstance from './axiosInstance';

export const apiGet = async <T>(url: string): Promise<T> => {
  return axiosInstance.get(url) as Promise<T>;
};
