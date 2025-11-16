import React, { useState } from 'react';
import { Modal, Typography, Row, Col, Card, Button, InputNumber, Space } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Dữ liệu mẫu danh mục và món
const menuData = [
  {
    id: 1,
    name: 'Món chính',
    dishes: [
      { id: 1, name: 'Phở Bò', price: 80000 },
      { id: 2, name: 'Bún Bò', price: 70000 },
      { id: 3, name: 'Cơm Gà', price: 60000 },
      { id: 4, name: 'Cơm Tấm', price: 55000 },
    ],
  },
  {
    id: 2,
    name: 'Món phụ',
    dishes: [
      { id: 5, name: 'Bánh Mì', price: 25000 },
      { id: 6, name: 'Chả Giò', price: 30000 },
      { id: 7, name: 'Nem Nướng', price: 35000 },
    ],
  },
  {
    id: 3,
    name: 'Đồ uống',
    dishes: [
      { id: 8, name: 'Nước ngọt', price: 15000 },
      { id: 9, name: 'Cà phê', price: 20000 },
      { id: 10, name: 'Trà đá', price: 10000 },
      { id: 11, name: 'Nước cam', price: 25000 },
    ],
  },
  {
    id: 4,
    name: 'Canh/Súp',
    dishes: [
      { id: 12, name: 'Canh chua', price: 50000 },
      { id: 13, name: 'Súp cua', price: 60000 },
    ],
  },
];

const AddDishModal = ({ open, onCancel, onAddDish, tableName, isTablet = true }) => {
  const [selectedCategory, setSelectedCategory] = useState(menuData[0]?.id || null);
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (dishId, value) => {
    setQuantities(prev => ({
      ...prev,
      [dishId]: value || 1,
    }));
  };

  const handleAddToTable = () => {
    const selectedDishes = [];
    
    Object.keys(quantities).forEach(dishId => {
      const quantity = quantities[dishId];
      if (quantity > 0) {
        menuData.forEach(category => {
          const dish = category.dishes.find(d => d.id === parseInt(dishId));
          if (dish) {
            selectedDishes.push({
              ...dish,
              quantity: quantity,
            });
          }
        });
      }
    });

    if (selectedDishes.length > 0) {
      onAddDish(selectedDishes);
      setQuantities({});
      onCancel();
    }
  };

  const currentCategory = menuData.find(cat => cat.id === selectedCategory);
  const selectedCount = Object.keys(quantities).filter(key => quantities[key] > 0).length;

  const modalWidth = isTablet ? 900 : 800;
  const titleSize = isTablet ? '28px' : '24px';
  const categoryFontSize = isTablet ? '18px' : '16px';
  const dishFontSize = isTablet ? '16px' : '14px';
  const buttonHeight = isTablet ? '48px' : '40px';

  return (
    <Modal
      title={
        <Title level={2} style={{ margin: 0, fontSize: titleSize }}>
          Thêm món cho {tableName}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
      style={{ top: isTablet ? 50 : 20 }}
    >
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={6}>
          <div style={{ borderRight: '1px solid #e8e8e8', paddingRight: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px', fontSize: categoryFontSize }}>
              Danh mục
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {menuData.map((category) => (
                <Button
                  key={category.id}
                  type={selectedCategory === category.id ? 'primary' : 'default'}
                  block
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    height: buttonHeight,
                    fontSize: categoryFontSize,
                    textAlign: 'left',
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </Space>
          </div>
        </Col>

        {/* Danh sách món bên phải */}
        <Col span={18}>
          <div>
            <Title level={4} style={{ marginBottom: '16px', fontSize: categoryFontSize }}>
              {currentCategory?.name || 'Chọn danh mục'}
            </Title>
            <Row gutter={[12, 12]}>
              {currentCategory?.dishes.map((dish) => (
                <Col span={12} key={dish.id}>
                  <Card
                    style={{
                      border: quantities[dish.id] > 0 ? '2px solid #1890ff' : '1px solid #e8e8e8',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ fontSize: dishFontSize, display: 'block', marginBottom: '8px' }}>
                          {dish.name}
                        </Text>
                        <Text style={{ fontSize: isTablet ? '14px' : '12px', color: '#666' }}>
                          {dish.price.toLocaleString('vi-VN')}đ
                        </Text>
                      </div>
                      <div style={{ marginLeft: '12px' }}>
                        <InputNumber
                          min={0}
                          max={99}
                          value={quantities[dish.id] || 0}
                          onChange={(value) => handleQuantityChange(dish.id, value)}
                          size={isTablet ? 'large' : 'middle'}
                          style={{ width: '80px' }}
                        />
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e8e8e8', textAlign: 'right' }}>
        <Space>
          <Text style={{ fontSize: dishFontSize, color: '#666' }}>
            Đã chọn: {selectedCount} món
          </Text>
          <Button onClick={onCancel} size={isTablet ? 'large' : 'middle'}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<ShoppingOutlined />}
            onClick={handleAddToTable}
            size={isTablet ? 'large' : 'middle'}
            disabled={selectedCount === 0}
            style={{ height: buttonHeight }}
          >
            Thêm vào bàn ({selectedCount})
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default AddDishModal;

