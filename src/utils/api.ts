import axiosInstance from './axiosInstance';

// Hàm GET
export const apiGet = async <T>(url: string): Promise<T> => {
  try {
    const response = await axiosInstance.get(url);
    return (response.data !== undefined ? response.data : response) as T;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi không xác định khi gọi API GET'
      );
    }
    throw new Error('Lỗi không xác định khi gọi API GET');
  }
};

// Hàm POST
export const apiPost = async <T>(url: string, data: unknown): Promise<T> => {
  try {
    const response = await axiosInstance.post(url, data);
    return (response.data !== undefined ? response.data : response) as T;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi không xác định khi gọi API POST'
      );
    }
    throw new Error('Lỗi không xác định khi gọi API POST');
  }
};

// Hàm PATCH (Quan trọng cho việc Hủy phòng)
export const apiPatch = async <T>(url: string, data: unknown): Promise<T> => {
  try {
    const response = await axiosInstance.patch(url, data);
    return (response.data !== undefined ? response.data : response) as T;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi không xác định khi gọi API PATCH'
      );
    }
    throw new Error('Lỗi không xác định khi gọi API PATCH');
  }
};

// Hàm DELETE
export const apiDelete = async <T>(url: string): Promise<T> => {
  try {
    const response = await axiosInstance.delete(url);
    return (response.data !== undefined ? response.data : response) as T;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      throw new Error(
        err?.response?.data?.message ||
        err?.message ||
        'Lỗi không xác định khi gọi API DELETE'
      );
    }
    throw new Error('Lỗi không xác định khi gọi API DELETE');
  }
};