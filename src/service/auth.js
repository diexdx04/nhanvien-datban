import axiosInstance from '../api/axiosInstance';

export const login = async (email, password) => {
  // Tạo config riêng cho login để không gửi token
  const config = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  };
  
  return axiosInstance.post('/login', {
    email,
    password,
  }, config);
};

export const logout = async () => {
  return axiosInstance.post('/auth/logout');
};

export const getCurrentUser = async () => {
  return axiosInstance.get('/auth/me');
};

