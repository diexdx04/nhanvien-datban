import React from 'react';
import { Button, Popover, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StatusColumn = ({ record, getPendingOrders, onConfirmOrder, isTablet = true }) => {
  const pendingOrders = getPendingOrders(record.orders);
  const count = pendingOrders.length;
  const buttonHeight = isTablet ? '48px' : '40px';
  const buttonFontSize = isTablet ? '16px' : '14px';
  const buttonMinWidth = isTablet ? '120px' : '100px';

  const renderStatusContent = () => {
    const contentFontSize = isTablet ? '16px' : '14px';
    const titleSize = isTablet ? '20px' : '18px';
    const popoverMinWidth = isTablet ? '300px' : '250px';
    
    if (pendingOrders.length === 0) {
      return <Text style={{ fontSize: contentFontSize }}>Không có món mới</Text>;
    }

    return (
      <div style={{ minWidth: popoverMinWidth }}>
        <Title level={4} style={{ marginBottom: '16px', fontSize: titleSize }}>
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
              <Text strong style={{ fontSize: contentFontSize, display: 'block' }}>
                {order.dish} x {order.quantity}
              </Text>
            </div>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => onConfirmOrder(record.id, order.id)}
              size="middle"
              style={{ fontSize: isTablet ? '14px' : '12px' }}
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
          fontSize: buttonFontSize,
          height: buttonHeight,
          minWidth: buttonMinWidth,
        }}
      >
        {count > 0 ? `${count} món mới` : 'Xem trạng thái'}
      </Button>
    </Popover>
  );
};

export default StatusColumn;

