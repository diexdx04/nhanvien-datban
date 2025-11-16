import axiosInstance from '../api/axiosInstance';

export const getCategories = async () => {
  const response = await axiosInstance.get('/menu-categories');
  return response;
};

export const getMenus = async (categoryId = null) => {
  const url = categoryId ? `/menus?category_id=${categoryId}` : '/menus';
  const response = await axiosInstance.get(url);
  return response;
};


