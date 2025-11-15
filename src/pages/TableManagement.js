import React, { useState } from 'react';
import { Card, Table, Typography } from 'antd';
import DishListColumn from '../components/DishListColumn';
import StatusColumn from '../components/StatusColumn';
import ActionColumn from '../components/ActionColumn';
import useDeviceType from '../hooks/useDeviceType';

const { Title, Text } = Typography;

const initialTables = [
  {
    id: 1,
    name: 'Bàn 1',
    orders: [
      { id: 1, dish: 'Phở Bò', quantity: 2, price: 80000, confirmed: true },
      { id: 2, dish: 'Bánh Mì', quantity: 1, price: 25000, confirmed: true },
      { id: 3, dish: 'Nước ngọt', quantity: 2, price: 15000, confirmed: false },
    ],
  },
  {
    id: 2,
    name: 'Bàn 2',
    orders: [
      { id: 4, dish: 'Cơm Gà', quantity: 3, price: 60000, confirmed: true },
      { id: 5, dish: 'Canh chua', quantity: 1, price: 50000, confirmed: false },
    ],
  },
  {
    id: 3,
    name: 'Bàn 3',
    orders: [],
  },
  {
    id: 4,
    name: 'Bàn 4',
    orders: [
      { id: 6, dish: 'Bún bò', quantity: 2, price: 70000, confirmed: false },
    ],
  },
];

const TableManagement = () => {
  const deviceType = useDeviceType();
  const [tables, setTables] = useState(initialTables);
  
  const isTablet = deviceType === 'tablet';

  const getConfirmedOrders = (orders) => {
    return orders.filter(order => order.confirmed === true);
  };

  const getPendingOrders = (orders) => {
    return orders.filter(order => order.confirmed === false);
  };

  const handleConfirmOrder = (tableId, orderId) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              orders: table.orders.map(order =>
                order.id === orderId
                  ? { ...order, confirmed: true }
                  : order
              ),
            }
          : table
      )
    );
  };

  const handleAddDish = (tableId) => {
  };

  const titleSize = isTablet ? '42px' : '32px';
  const cardTitleSize = isTablet ? '32px' : '24px';
  const tableFontSize = isTablet ? '18px' : '16px';
  const columnWidth = isTablet ? { name: 150, status: 200, action: 150 } : { name: 120, status: 180, action: 130 };
  const padding = isTablet ? '30px' : '20px';

  const tableColumns = [
    {
      title: 'Bàn',
      dataIndex: 'name',
      key: 'name',
      width: columnWidth.name,
      render: (text) => <Text strong style={{ fontSize: tableFontSize }}>{text}</Text>,
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
            dataSource={tables}
            columns={tableColumns}
            rowKey="id"
            pagination={false}
            size={isTablet ? 'large' : 'middle'}
            style={{ fontSize: tableFontSize }}
          />
        </Card>
      </div>
    </div>
  );
};

export default TableManagement;
