import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import useDeviceType from '../hooks/useDeviceType';

const { Title } = Typography;

const loginSchema = yup.object({
  username: yup
    .string()
    .required('Vui lòng nhập tên đăng nhập')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const Login = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Styles theo device type
  const isTablet = deviceType === 'tablet';
  const containerStyle = isTablet
    ? { minWidth: '1024px', minHeight: '1366px' }
    : { width: '100%', height: '100vh' };
  
  const cardStyle = isTablet
    ? { width: '600px', padding: '60px 50px' }
    : { width: '450px', maxWidth: '90%', padding: '40px 35px' };
  
  const titleSize = isTablet ? '48px' : '36px';
  const labelSize = isTablet ? '18px' : '16px';
  const inputHeight = isTablet ? '56px' : '48px';
  const inputFontSize = isTablet ? '18px' : '16px';
  const buttonHeight = isTablet ? '60px' : '50px';
  const buttonFontSize = isTablet ? '20px' : '18px';
  const iconSize = isTablet ? '20px' : '18px';
  const mbSpacing = isTablet ? { mb6: 'mb-6', mb8: 'mb-8', mb10: 'mb-10' } : { mb6: 'mb-4', mb8: 'mb-6', mb10: 'mb-8' };

  const onSubmit = async (data) => {
    try {
      console.log('Login data:', data);
      navigate('/tables');
    } catch (error) {
      console.error('Login error:', error);
      alert('Đăng nhập thất bại!');
    }
  };

  return (
    <div 
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('/nen.avif')`,
        ...containerStyle,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <Card 
        className="shadow-2xl relative z-10"
        style={{
          ...cardStyle,
          borderRadius: '16px',
        }}
      >
        <div className={`text-center ${mbSpacing.mb10}`}>
          <Title level={1} className="mb-4" style={{ fontSize: titleSize, fontWeight: 'bold' }}>
            Đăng Nhập
          </Title>
          <p className="text-gray-600" style={{ fontSize: isTablet ? '18px' : '16px' }}>
            Vui lòng đăng nhập vào hệ thống
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={mbSpacing.mb6}>
            <label className="block font-medium text-gray-700 mb-3" style={{ fontSize: labelSize }}>
              Tên đăng nhập
            </label>
            <Input
              {...register('username')}
              size="large"
              prefix={<UserOutlined className="text-gray-400" style={{ fontSize: iconSize }} />}
              placeholder="Nhập tên đăng nhập"
              className={errors.username ? 'border-red-500' : ''}
              style={{
                height: inputHeight,
                fontSize: inputFontSize,
                padding: '12px 16px',
              }}
            />
            {errors.username && (
              <p className="text-red-500 mt-2" style={{ fontSize: isTablet ? '16px' : '14px' }}>
                {errors.username.message}
              </p>
            )}
          </div>

          <div className={mbSpacing.mb8}>
            <label className="block font-medium text-gray-700 mb-3" style={{ fontSize: labelSize }}>
              Mật khẩu
            </label>
            <Input.Password
              {...register('password')}
              size="large"
              prefix={<LockOutlined className="text-gray-400" style={{ fontSize: iconSize }} />}
              placeholder="Nhập mật khẩu"
              className={errors.password ? 'border-red-500' : ''}
              style={{
                height: inputHeight,
                fontSize: inputFontSize,
                padding: '12px 16px',
              }}
            />
            {errors.password && (
              <p className="text-red-500 mt-2" style={{ fontSize: isTablet ? '16px' : '14px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
            style={{
              height: buttonHeight,
              fontSize: buttonFontSize,
              fontWeight: '600',
              borderRadius: '8px',
            }}
          >
            Đăng Nhập
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;

