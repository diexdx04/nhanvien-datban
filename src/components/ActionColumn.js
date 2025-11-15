import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ActionColumn = ({ record, onAddDish, isTablet = true }) => {
  const buttonHeight = isTablet ? '48px' : '40px';
  const buttonFontSize = isTablet ? '16px' : '14px';
  
  return (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      size={isTablet ? 'large' : 'middle'}
      style={{ fontSize: buttonFontSize, height: buttonHeight }}
      onClick={() => onAddDish && onAddDish(record.id)}
    >
      Thêm món
    </Button>
  );
};

export default ActionColumn;

