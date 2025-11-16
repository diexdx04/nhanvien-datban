import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Typography, Row, Col, Card, Button, InputNumber, Space, Spin } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { getCategories, getMenus } from '../service/menu';

const { Title, Text } = Typography;

const AddDishModal = ({ open, onCancel, onAddDish, reservationCode, tableNames, isTablet = true }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantities, setQuantities] = useState({});

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories();
      return response;
    },
    enabled: open,
    select: (data) => {
      if (data && data.status === "success" && data.data) {
        return data.data;
      }
      return [];
    },
  });

  const {
    data: menusData,
    isLoading: isLoadingMenus,
  } = useQuery({
    queryKey: ['menus', selectedCategory],
    queryFn: async () => {
      const response = await getMenus(selectedCategory);
      return response;
    },
    enabled: open && selectedCategory !== null,
    select: (data) => {
      if (data && data.status === "success" && data.data) {
        return data.data;
      }
      return [];
    },
  });

  React.useEffect(() => {
    if (categoriesData && categoriesData.length > 0 && selectedCategory === null) {
      setSelectedCategory(categoriesData[0].id);
    }
  }, [categoriesData, selectedCategory]);

  React.useEffect(() => {
    if (!open) {
      setQuantities({});
      setSelectedCategory(null);
    }
  }, [open]);

  const handleQuantityChange = (dishId, value) => {
    setQuantities(prev => ({
      ...prev,
      [dishId]: value || 0,
    }));
  };

  const handleAddToTable = () => {
    const selectedDishes = [];
    
    Object.keys(quantities).forEach(dishId => {
      const quantity = quantities[dishId];
      if (quantity > 0 && menusData) {
        const dish = menusData.find(d => d.id === parseInt(dishId));
        if (dish) {
          selectedDishes.push({
            id: dish.id,
            name: dish.name,
            price: parseFloat(dish.price),
            quantity: quantity,
          });
        }
      }
    });

    if (selectedDishes.length > 0) {
      onAddDish(reservationCode, selectedDishes);
      setQuantities({});
      onCancel();
    }
  };

  const currentCategory = categoriesData?.find(cat => cat.id === selectedCategory);
  const selectedCount = Object.keys(quantities).filter(key => quantities[key] > 0).length;

  const modalWidth = 1000;
  const titleSize = isTablet ? '28px' : '24px';
  const categoryFontSize = isTablet ? '18px' : '16px';
  const dishFontSize = isTablet ? '16px' : '14px';
  const buttonHeight = isTablet ? '48px' : '40px';

  const displayTableNames = Array.isArray(tableNames) 
    ? tableNames.join(', ') 
    : tableNames || 'bàn';

  return (
    <Modal
      title={
        <Title level={2} style={{ margin: 0, fontSize: titleSize }}>
          Thêm món cho {displayTableNames}
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
    >
      {isLoadingCategories ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: '16px', fontSize: dishFontSize }}>
            Đang tải danh mục...
          </Text>
        </div>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col span={6}>
            <div style={{ borderRight: '1px solid #e8e8e8', paddingRight: '16px' }}>
              <Title level={4} style={{ marginBottom: '16px', fontSize: categoryFontSize }}>
                Danh mục
              </Title>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {categoriesData?.map((category) => (
                  <Button
                    key={category.id}
                    type={selectedCategory === category.id ? 'primary' : 'default'}
                    block
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setQuantities({});
                    }}
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

          <Col span={18}>
            <div>
              <Title level={4} style={{ marginBottom: '16px', fontSize: categoryFontSize }}>
                {currentCategory?.name || 'Chọn danh mục'}
              </Title>
              {isLoadingMenus ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <Text style={{ display: 'block', marginTop: '16px', fontSize: dishFontSize }}>
                    Đang tải danh sách món...
                  </Text>
                </div>
              ) : menusData && menusData.length > 0 ? (
                <Row gutter={[12, 12]}>
                  {menusData.map((dish) => (
                    <Col span={12} key={dish.id}>
                      <Card
                        cover={
                          dish.image_url ? (
                            <img
                              alt={dish.name}
                              src={dish.image_url}
                              style={{
                                height: '200px',
                                objectFit: 'cover',
                                width: '100%',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: '200px',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                                fontSize: '14px',
                              }}
                            >
                             ảnh món
                            </div>
                          )
                        }
                        style={{
                          border: quantities[dish.id] > 0 ? '2px solid #1890ff' : '1px solid #e8e8e8',
                        }}
                        bodyStyle={{ padding: '12px' }}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <Text strong style={{ fontSize: dishFontSize, display: 'block', marginBottom: '8px' }}>
                            {dish.name}
                          </Text>
                          <Text style={{ fontSize: isTablet ? '14px' : '12px', color: '#666', display: 'block' }}>
                            {parseFloat(dish.price).toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <InputNumber
                            min={0}
                            max={99}
                            value={quantities[dish.id] || 0}
                            onChange={(value) => handleQuantityChange(dish.id, value)}
                            size={isTablet ? 'large' : 'middle'}
                            style={{ width: '80px' }}
                          />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Text style={{ fontSize: dishFontSize, color: '#999' }}>
                    Không có món trong danh mục này
                  </Text>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}

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
