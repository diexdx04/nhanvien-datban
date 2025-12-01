import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card, Typography, message } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import useDeviceType from '../hooks/useDeviceType';
import { login } from '../service/auth';

const { Title } = Typography;

const loginSchema = yup.object({
  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const Login = () => {
  const navigate = useNavigate();
  const deviceType = useDeviceType();
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

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
      const response = await login(data.phone, data.password);
  
      
      if (response && response.success === false) {
        messageApi.error(response.message || 'Số điện thoại hoặc mật khẩu không đúng.');
        return;
      }
      
      if (response && response.success === true && response.data) {
        const user = response.data.user;
     
        
        if (!user) {
          messageApi.error('Không tìm thấy thông tin người dùng!');
          return;
        }
        
        if (user.role !== 'admin') {
          messageApi.error('Bạn không có quyền truy cập!');
          return;
        }
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        messageApi.success(response.message || 'Đăng nhập thành công!');
        
        navigate('/tables');
      } else {
        messageApi.error(response?.message || 'Vui lòng kiểm tra lại thông tin đăng nhập!');
      }
    } catch (error) {
      
      let errorMessage = 'Đăng nhập thất bại!';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } 
        else if (error.response && error.response.data) {
          if (error.response.data.errors) {
            const allErrors = Object.values(error.response.data.errors).flat();
            errorMessage = allErrors.join(', ');
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        else if (error.data && error.data.message) {
          errorMessage = error.data.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      messageApi.error(errorMessage);
    }
  };

  return (
    <>
      {contextHolder}
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

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit)(e);
            }}
          >
            <div className={mbSpacing.mb6}>
              <label className="block font-medium text-gray-700 mb-3" style={{ fontSize: labelSize }}>
                Số điện thoại
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="tel"
                    size="large"
                    prefix={<PhoneOutlined className="text-gray-400" style={{ fontSize: iconSize }} />}
                    placeholder="Nhập số điện thoại"
                    status={errors.phone ? 'error' : ''}
                    style={{
                      height: inputHeight,
                      fontSize: inputFontSize,
                      padding: '12px 16px',
                    }}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 mt-2" style={{ fontSize: isTablet ? '16px' : '14px' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className={mbSpacing.mb8}>
              <label className="block font-medium text-gray-700 mb-3" style={{ fontSize: labelSize }}>
                Mật khẩu
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    prefix={<LockOutlined className="text-gray-400" style={{ fontSize: iconSize }} />}
                    placeholder="Nhập mật khẩu"
                    status={errors.password ? 'error' : ''}
                    style={{
                      height: inputHeight,
                      fontSize: inputFontSize,
                      padding: '12px 16px',
                    }}
                  />
                )}
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
              className="bg-blue-600"
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
    </>
  );
};

export default Login;