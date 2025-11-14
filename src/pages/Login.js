import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      console.log('Login data:', data);
        alert('Đăng nhập thành công!');
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
        minWidth: '1024px',
        minHeight: '1366px',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <Card 
        className="w-[600px] shadow-2xl relative z-10"
        style={{
          padding: '60px 50px',
          borderRadius: '16px',
        }}
      >
        <div className="text-center mb-10">
          <Title level={1} className="mb-4" style={{ fontSize: '48px', fontWeight: 'bold' }}>
            Đăng Nhập
          </Title>
          <p className="text-gray-600 text-lg">Vui lòng đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="block text-base font-medium text-gray-700 mb-3" style={{ fontSize: '18px' }}>
              Tên đăng nhập
            </label>
            <Input
              {...register('username')}
              size="large"
              prefix={<UserOutlined className="text-gray-400" style={{ fontSize: '20px' }} />}
              placeholder="Nhập tên đăng nhập"
              className={errors.username ? 'border-red-500' : ''}
              style={{
                height: '56px',
                fontSize: '18px',
                padding: '12px 16px',
              }}
            />
            {errors.username && (
              <p className="text-red-500 text-base mt-2" style={{ fontSize: '16px' }}>
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-base font-medium text-gray-700 mb-3" style={{ fontSize: '18px' }}>
              Mật khẩu
            </label>
            <Input.Password
              {...register('password')}
              size="large"
              prefix={<LockOutlined className="text-gray-400" style={{ fontSize: '20px' }} />}
              placeholder="Nhập mật khẩu"
              className={errors.password ? 'border-red-500' : ''}
              style={{
                height: '56px',
                fontSize: '18px',
                padding: '12px 16px',
              }}
            />
            {errors.password && (
              <p className="text-red-500 text-base mt-2" style={{ fontSize: '16px' }}>
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
              height: '60px',
              fontSize: '20px',
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

