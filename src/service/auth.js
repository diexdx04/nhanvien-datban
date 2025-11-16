import axiosInstance from '../api/axiosInstance';

export const login = async (email, password) => {
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

