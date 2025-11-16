import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Table, Typography, message } from 'antd';
import DishListColumn from '../components/DishListColumn';
import StatusColumn from '../components/StatusColumn';
import ActionColumn from '../components/ActionColumn';
import useDeviceType from '../hooks/useDeviceType';
import { getServingReservations } from '../service/tables';

const { Title, Text } = Typography;

const TableManagement = () => {
  const deviceType = useDeviceType();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  
  const isTablet = deviceType === 'tablet';

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
        confirmed: true,
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
      return response;
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

      const previousReservations = queryClient.getQueryData(['servingReservations']);

      queryClient.setQueryData(['servingReservations'], (old) => {
        if (!old) return old;
        return old.map((reservation) =>
          reservation.reservation_code === reservationCode
            ? {
                ...reservation,
                orders: reservation.orders.map((order) =>
                  order.id === orderId
                    ? { ...order, confirmed: true }
                    : order
                ),
              }
            : reservation
        );
      });

      return { previousReservations };
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

  const reservations = useMemo(() => reservationsData || [], [reservationsData]);

  const getConfirmedOrders = (orders) => {
    return orders.filter(order => order.confirmed === true);
  };

  const getPendingOrders = (orders) => {
    return orders.filter(order => order.confirmed === false);
  };

  const handleConfirmOrder = (reservationCode, orderId) => {
    confirmOrderMutation.mutate({ reservationCode, orderId });
  };

  const handleAddDish = (reservationCode) => {
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
    </>
  );
};

export default TableManagement;
