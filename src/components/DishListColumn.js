import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const DishListColumn = ({ orders, getConfirmedOrders, isTablet = true }) => {
  const confirmedOrders = getConfirmedOrders(orders);
  const fontSize = isTablet ? '16px' : '14px';

  if (confirmedOrders.length === 0) {
    return <Text style={{ fontSize: fontSize, color: '#999' }}>Chưa có món</Text>;
  }

  return (
    <div>
      {confirmedOrders.map((order) => (
        <div key={order.id} style={{ marginBottom: '8px' }}>
          <Text style={{ fontSize: fontSize }}>
            {order.dish} x {order.quantity}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default DishListColumn;

