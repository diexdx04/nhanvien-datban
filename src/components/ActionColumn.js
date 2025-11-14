import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ActionColumn = ({ record, onAddDish }) => {
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      size="large"
      style={{ fontSize: '16px', height: '48px' }}
      onClick={() => onAddDish && onAddDish(record.id)}
    >
      Thêm món
    </Button>
  );
};

export default ActionColumn;

