import axiosInstance from '../api/axiosInstance';

export const getServingReservations = async () => {
  const response = await axiosInstance.get('/dat-ban-an/serving');
  return response;
};

export const addOrderItems = async (reservationId, menus) => {
  const response = await axiosInstance.post('/dat-ban-an/order-items', {
    reservation_id: reservationId,
    menus: menus,
  });
  return response;
};

