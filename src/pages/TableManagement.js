import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Typography, message } from 'antd';
import DishListColumn from '../components/DishListColumn';
import StatusColumn from '../components/StatusColumn';
import ActionColumn from '../components/ActionColumn';
import AddDishModal from '../components/AddDishModal';
import useDeviceType from '../hooks/useDeviceType';
import { getServingReservations } from '../service/tables';

const { Title, Text } = Typography;

const TableManagement = () => {
  const deviceType = useDeviceType();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  
  const isTablet = deviceType === 'tablet';

  const STORAGE_KEY = 'pendingDishes';

  const getPendingDishesFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const savePendingDishesToStorage = (pendingDishes) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingDishes));
    } catch (error) {
      // Silent fail
    }
  };

  const addPendingDishToStorage = (reservationCode, dishes) => {
    const pendingDishes = getPendingDishesFromStorage();
    const existing = pendingDishes[reservationCode] || [];
    const newMenus = dishes.map((dish, index) => ({
      id: `${dish.id}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      dishId: dish.id,
      name: dish.name,
      quantity: dish.quantity,
      price: dish.price.toString(),
      _isNew: true,
    }));
    pendingDishes[reservationCode] = [...existing, ...newMenus];
    savePendingDishesToStorage(pendingDishes);
    return newMenus;
  };

  const removePendingDishFromStorage = (reservationCode, orderId) => {
    const pendingDishes = getPendingDishesFromStorage();
    if (pendingDishes[reservationCode]) {
      pendingDishes[reservationCode] = pendingDishes[reservationCode].filter(
        (menu) => menu.id !== orderId
      );
      if (pendingDishes[reservationCode].length === 0) {
        delete pendingDishes[reservationCode];
      }
      savePendingDishesToStorage(pendingDishes);
    }
  };

  const mergePendingDishesWithData = (data) => {
    if (!data || !data.success || !data.data) {
      return data;
    }

    const pendingDishes = getPendingDishesFromStorage();
    const mergedData = {
      ...data,
      data: data.data.map((reservation) => {
        const pendingMenus = pendingDishes[reservation.reservation_code] || [];
        if (pendingMenus.length === 0) {
          return reservation;
        }
        return {
          ...reservation,
          menus: [...(reservation.menus || []), ...pendingMenus],
        };
      }),
    };
    return mergedData;
  };

  const transformReservations = (data) => {
    if (!data || !data.success || !data.data) {
      return [];
    }

    return data.data.map((reservation) => {
      const orders = reservation.menus.map((menu) => ({
        id: menu.id,
        dish: menu.name,
        quantity: menu.quantity,
        price: parseFloat(menu.price),
        confirmed: menu._isNew ? false : true,
      }));

      return {
        id: reservation.reservation_code,
        reservation_code: reservation.reservation_code,
        tables: reservation.tables,
        orders: orders,
      };
    });
  };

  const {
    data: reservationsData,
    isLoading,
  } = useQuery({
    queryKey: ['servingReservations'],
    queryFn: async () => {
      const response = await getServingReservations();
      const mergedData = mergePendingDishesWithData(response);
      return mergedData;
    },
    select: (data) => transformReservations(data),
    onError: (error) => {
      let errorMessage = 'Lỗi khi tải danh sách đơn đặt bàn!';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      messageApi.error(errorMessage);
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: async ({ reservationCode, orderId }) => {
      return { reservationCode, orderId };
    },
    onMutate: async ({ reservationCode, orderId }) => {
      await queryClient.cancelQueries({ queryKey: ['servingReservations'] });

      const queryCache = queryClient.getQueryCache();
      const query = queryCache.find({ queryKey: ['servingReservations'] });
      const previousRawData = query?.state?.data;

      removePendingDishFromStorage(reservationCode, orderId);

      if (previousRawData && previousRawData.success && previousRawData.data) {
        const updatedRawData = {
          ...previousRawData,
          data: previousRawData.data.map((reservation) => {
            if (reservation.reservation_code === reservationCode) {
              const updatedMenus = (reservation.menus || []).map((menu) => {
                if (menu.id === orderId) {
                  const { _isNew, ...menuWithoutNew } = menu;
                  return menuWithoutNew;
                }
                return menu;
              });
              return {
                ...reservation,
                menus: updatedMenus,
              };
            }
            return reservation;
          }),
        };
        queryClient.setQueryData(['servingReservations'], updatedRawData);
      }

      return { previousReservations: transformReservations(previousRawData || { success: true, data: [] }) };
    },
    onError: (err, variables, context) => {
      if (context?.previousReservations) {
        queryClient.setQueryData(['servingReservations'], context.previousReservations);
      }
      messageApi.error('Không thể xác nhận món!');
    },
    onSuccess: () => {
      messageApi.success('Đã xác nhận món thành công!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['servingReservations'] });
    },
  });

  const addDishMutation = useMutation({
    mutationFn: async ({ reservationCode, dishes }) => {
      return Promise.resolve({ reservationCode, dishes });
    },
    onMutate: async ({ reservationCode, dishes }) => {
      await queryClient.cancelQueries({ queryKey: ['servingReservations'] });

      const queryCache = queryClient.getQueryCache();
      const query = queryCache.find({ queryKey: ['servingReservations'] });
      const previousRawData = query?.state?.data;

      if (!previousRawData || !previousRawData.success || !previousRawData.data) {
        return { previousReservations: null };
      }

      const newMenus = addPendingDishToStorage(reservationCode, dishes);

      const updatedRawData = {
        ...previousRawData,
        data: previousRawData.data.map((reservation) => {
          if (reservation.reservation_code === reservationCode) {
            const currentMenus = reservation.menus || [];
            return {
              ...reservation,
              menus: [...currentMenus, ...newMenus],
            };
          }
          return reservation;
        }),
      };

      queryClient.setQueryData(['servingReservations'], updatedRawData);

      return { previousReservations: transformReservations(previousRawData) };
    },
    onError: (err, variables, context) => {
      if (context?.previousReservations) {
        queryClient.setQueryData(['servingReservations'], context.previousReservations);
      }
      const errorMessage = err?.message || 'Không thể thêm món!';
      messageApi.error(errorMessage);
    },
    onSuccess: () => {
      messageApi.success('Đã thêm món thành công!');
    },
  });

  const reservations = useMemo(() => reservationsData || [], [reservationsData]);

  const getConfirmedOrders = (orders) => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter(order => order.confirmed === true);
  };

  const getPendingOrders = (orders) => {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    return orders.filter(order => order.confirmed === false);
  };

  const handleConfirmOrder = (reservationCode, orderId) => {
    confirmOrderMutation.mutate({ reservationCode, orderId });
  };

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ reservationCode, orderId }) => {
      // TODO: Gọi API xóa món khi có endpoint
      return Promise.resolve({ reservationCode, orderId });
    },
    onMutate: async ({ reservationCode, orderId }) => {
      await queryClient.cancelQueries({ queryKey: ['servingReservations'] });

      const queryCache = queryClient.getQueryCache();
      const query = queryCache.find({ queryKey: ['servingReservations'] });
      const previousRawData = query?.state?.data;

      if (!previousRawData || !previousRawData.success || !previousRawData.data) {
        return { previousRawData: null };
      }

      removePendingDishFromStorage(reservationCode, orderId);

      const updatedRawData = {
        ...previousRawData,
        data: previousRawData.data.map((reservation) => {
          if (reservation.reservation_code === reservationCode) {
            const updatedMenus = (reservation.menus || []).filter(
              (menu) => menu.id !== orderId
            );
            
            return {
              ...reservation,
              menus: updatedMenus,
            };
          }
          return reservation;
        }),
      };

      queryClient.setQueryData(['servingReservations'], updatedRawData);

      return { previousRawData };
    },
    onError: (err, variables, context) => {
      if (context?.previousRawData) {
        queryClient.setQueryData(['servingReservations'], context.previousRawData);
      }
      messageApi.error('Không thể xóa món!');
    },
    onSuccess: () => {
      messageApi.success('Đã xóa món thành công!');
    },
  });

  const handleCancelOrder = (reservationCode, orderId) => {
    cancelOrderMutation.mutate({ reservationCode, orderId });
  };

  const handleAddDish = (reservationCode) => {
    const reservation = reservations.find(r => r.reservation_code === reservationCode);
    if (reservation) {
      setSelectedReservation(reservation);
      setModalOpen(true);
    }
  };

  const handleAddDishSubmit = (reservationCode, dishes) => {
    addDishMutation.mutate({ reservationCode, dishes });
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedReservation(null);
  };

  const titleSize = isTablet ? '42px' : '32px';
  const cardTitleSize = isTablet ? '32px' : '24px';
  const tableFontSize = isTablet ? '18px' : '16px';
  const columnWidth = isTablet ? { name: 200, status: 200, action: 150 } : { name: 180, status: 180, action: 130 };
  const padding = isTablet ? '30px' : '20px';

  const tableColumns = [
    {
      title: 'Bàn',
      key: 'tables',
      width: columnWidth.name,
      render: (_, record) => {
        const tableNames = record.tables.map(table => table.name).join(', ');
        return <Text strong style={{ fontSize: tableFontSize }}>{tableNames}</Text>;
      },
    },
    {
      title: 'Danh sách món',
      key: 'confirmedOrders',
      render: (_, record) => (
        <DishListColumn
          orders={record.orders}
          getConfirmedOrders={getConfirmedOrders}
          isTablet={isTablet}
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: columnWidth.status,
      render: (_, record) => (
        <StatusColumn
          record={record}
          getPendingOrders={getPendingOrders}
          onConfirmOrder={handleConfirmOrder}
          onCancelOrder={handleCancelOrder}
          isTablet={isTablet}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: columnWidth.action,
      render: (_, record) => (
        <ActionColumn
          record={record}
          onAddDish={handleAddDish}
          isTablet={isTablet}
        />
      ),
    },
  ];

  const tableNames = selectedReservation?.tables.map(table => table.name) || [];

  return (
    <>
      {contextHolder}
      <div
        className="h-screen w-screen bg-gray-50"
        style={{
          ...(isTablet ? { minWidth: '1024px', minHeight: '1366px' } : { width: '100%', height: '100vh' }),
          padding: padding,
          overflow: 'auto',
        }}
      >
        <div className="mb-6">
          <Title level={1} style={{ margin: 0, fontSize: titleSize }}>
            Quản Lý Bàn Ăn
          </Title>
        </div>

        <div>
          <Card
            title={
              <Title level={2} style={{ margin: 0, fontSize: cardTitleSize }}>
                Đơn đặt bàn
              </Title>
            }
          >
            <Table
              dataSource={reservations}
              columns={tableColumns}
              rowKey="reservation_code"
              pagination={false}
              size={isTablet ? 'large' : 'middle'}
              style={{ fontSize: tableFontSize }}
              loading={isLoading}
            />
          </Card>
        </div>
      </div>

      <AddDishModal
        open={modalOpen}
        onCancel={handleModalCancel}
        onAddDish={handleAddDishSubmit}
        reservationCode={selectedReservation?.reservation_code}
        tableNames={tableNames}
        isTablet={isTablet}
      />
    </>
  );
};

export default TableManagement;
