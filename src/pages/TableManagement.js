import React, { useState } from 'react';
import { Card, Table, Typography } from 'antd';
import DishListColumn from '../components/DishListColumn';
import StatusColumn from '../components/StatusColumn';
import ActionColumn from '../components/ActionColumn';

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
  const [tables, setTables] = useState(initialTables);

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

  const tableColumns = [
    {
      title: 'Bàn',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <Text strong style={{ fontSize: '18px' }}>{text}</Text>,
    },
    {
      title: 'Danh sách món',
      key: 'confirmedOrders',
      render: (_, record) => (
        <DishListColumn
          orders={record.orders}
          getConfirmedOrders={getConfirmedOrders}
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 200,
      render: (_, record) => (
        <StatusColumn
          record={record}
          getPendingOrders={getPendingOrders}
          onConfirmOrder={handleConfirmOrder}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <ActionColumn
          record={record}
          onAddDish={handleAddDish}
        />
      ),
    },
  ];

  return (
    <div
      className="h-screen w-screen bg-gray-50"
      style={{
        minWidth: '1024px',
        minHeight: '1366px',
        padding: '30px',
        overflow: 'auto',
      }}
    >
      <div className="mb-6">
        <Title level={1} style={{ margin: 0, fontSize: '42px' }}>
          Quản Lý Bàn Ăn
        </Title>
      </div>

      <div>
        <Card
          title={
            <Title level={2} style={{ margin: 0, fontSize: '32px' }}>
              Đơn đặt bàn
            </Title>
          }
        >
          <Table
            dataSource={tables}
            columns={tableColumns}
            rowKey="id"
            pagination={false}
            size="large"
            style={{ fontSize: '18px' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default TableManagement;
