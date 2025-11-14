import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const DishListColumn = ({ orders, getConfirmedOrders }) => {
  const confirmedOrders = getConfirmedOrders(orders);

  if (confirmedOrders.length === 0) {
    return <Text style={{ fontSize: '16px', color: '#999' }}>Chưa có món</Text>;
  }

  return (
    <div>
      {confirmedOrders.map((order) => (
        <div key={order.id} style={{ marginBottom: '8px' }}>
          <Text style={{ fontSize: '16px' }}>
            {order.dish} x {order.quantity}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default DishListColumn;

