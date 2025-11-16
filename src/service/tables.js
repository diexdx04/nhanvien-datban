import axiosInstance from '../api/axiosInstance';

export const getServingReservations = async () => {
  const response = await axiosInstance.get('/dat-ban-an/serving');
  return response;
};

