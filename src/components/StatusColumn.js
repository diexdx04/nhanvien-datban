import React from 'react';
import { Button, Popover, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StatusColumn = ({ record, getPendingOrders, onConfirmOrder }) => {
  const pendingOrders = getPendingOrders(record.orders);
  const count = pendingOrders.length;

  const renderStatusContent = () => {
    if (pendingOrders.length === 0) {
      return <Text style={{ fontSize: '16px' }}>Không có món mới</Text>;
    }

    return (
      <div style={{ minWidth: '300px' }}>
        <Title level={4} style={{ marginBottom: '16px', fontSize: '20px' }}>
          Món mới thêm:
        </Title>
        {pendingOrders.map((order) => (
          <div
            key={order.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              marginBottom: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block' }}>
                {order.dish} x {order.quantity}
              </Text>
            </div>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onConfirmOrder(record.id, order.id)}
              size="middle"
              style={{ fontSize: '14px' }}
            >
              Đã xong
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Popover
      content={renderStatusContent()}
      title={null}
      trigger="click"
      placement="left"
    >
      <Button
        type={count > 0 ? 'primary' : 'default'}
        style={{
          fontSize: '16px',
          height: '48px',
          minWidth: '120px',
        }}
      >
        {count > 0 ? `${count} món mới` : 'Xem trạng thái'}
      </Button>
    </Popover>
  );
};

export default StatusColumn;

