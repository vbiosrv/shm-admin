import { useState, useEffect } from 'react';
import { Cloud, LogIn, LogOut, UserPlus, Plus, DollarSign, Coins, Check, X, ShoppingCart, Zap, Gift, Rocket } from 'lucide-react';
import { shm_request } from '../lib/shm_request';
import toast from 'react-hot-toast';
import { PaymentModal } from '../modals/PaymentModal';

interface CloudUser {
  login?: string;
  balance?: number;
  [key: string]: any;
}

interface TariffFeature {
  name: string;
  status: 'yes' | 'no' | 'optional';
}

interface Tariff {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  icon: any;
  features: TariffFeature[];
}

const TARIFFS: Tariff[] = [
  {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    description: 'Базовые возможности',
    color: '#6b7280',
    icon: Gift,
    features: [
      { name: 'Marketplace шаблонов', status: 'yes' },
      { name: 'Закрытая Telegram группа', status: 'no' },
      { name: 'Обновления платежных систем и шаблонов', status: 'no' },
      { name: 'Голосование за доработки', status: 'no' },
      { name: 'Конвертер валют', status: 'optional' },
      { name: 'Email рассылки', status: 'optional' },
      { name: 'Версионирование шаблонов', status: 'optional' },
      { name: 'Бэкапы', status: 'optional' },
      { name: 'SMS рассылки', status: 'optional' },
      { name: 'Продажа своих шаблонов', status: 'no' },
      { name: 'Аналитика (метрики)', status: 'no' },
    ],
  },
  {
    id: 'basic',
    name: 'Базовый',
    price: 700,
    description: 'Расширенные возможности',
    color: '#22c55e',
    icon: Zap,
    features: [
      { name: 'Marketplace шаблонов', status: 'yes' },
      { name: 'Закрытая Telegram группа', status: 'yes' },
      { name: 'Обновления платежных систем и шаблонов', status: 'yes' },
      { name: 'Голосование за доработки', status: 'yes' },
      { name: 'Конвертер валют', status: 'optional' },
      { name: 'Email рассылки', status: 'optional' },
      { name: 'Версионирование шаблонов', status: 'optional' },
      { name: 'Бэкапы', status: 'optional' },
      { name: 'SMS рассылки', status: 'optional' },
      { name: 'Продажа своих шаблонов', status: 'no' },
      { name: 'Аналитика (метрики)', status: 'no' },
    ],
  },
  {
    id: 'premium',
    name: 'Расширенный',
    price: 900,
    description: 'Полный функционал',
    color: '#3b82f6',
    icon: Rocket,
    features: [
      { name: 'Marketplace шаблонов', status: 'yes' },
      { name: 'Закрытая Telegram группа', status: 'yes' },
      { name: 'Обновления платежных систем и шаблонов', status: 'yes' },
      { name: 'Голосование за доработки', status: 'yes' },
      { name: 'Конвертер валют', status: 'yes' },
      { name: 'Email рассылки', status: 'yes' },
      { name: 'Версионирование шаблонов', status: 'yes' },
      { name: 'Бэкапы', status: 'optional' },
      { name: 'SMS рассылки', status: 'optional' },
      { name: 'Продажа своих шаблонов', status: 'yes' },
      { name: 'Аналитика (метрики)', status: 'yes' },
    ],
  },
];

function SHMCloud() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cloudUser, setCloudUser] = useState<CloudUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ login: '', password: '' });
  const [registerData, setRegisterData] = useState({ login: '', password: '' });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const getFeatureIcon = (status: 'yes' | 'no' | 'optional') => {
    switch (status) {
      case 'yes':
        return <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-success)' }} />;
      case 'no':
        return <X className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-danger)' }} />;
      case 'optional':
        return <ShoppingCart className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-warning)' }} />;
    }
  };

  const getFeatureText = (status: 'yes' | 'no' | 'optional') => {
    switch (status) {
      case 'yes':
        return { text: 'Да', color: 'var(--accent-success)' };
      case 'no':
        return { text: 'Нет', color: 'var(--accent-danger)' };
      case 'optional':
        return { text: 'Опционально', color: 'var(--accent-warning)' };
    }
  };

  const getFeatureTextColor = (status: 'yes' | 'no' | 'optional') => {
    return status === 'yes' ? 'var(--theme-content-text)' : 'var(--theme-content-text-muted)';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await shm_request('shm/v1/admin/cloud/user');
      const userData = res.data || res;
      
      if (Array.isArray(userData) && userData.length > 0) {
        const user = userData[0];
        setCloudUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('cloud_auth', JSON.stringify({ user }));
      } else if (userData.user_id || userData.login) {
        setCloudUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('cloud_auth', JSON.stringify({ user: userData }));
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('cloud_auth');
      }
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('cloud_auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shm_request('shm/v1/admin/cloud/user/auth', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      
      await checkAuth();
      toast.success('Успешная авторизация');
      setLoginData({ login: '', password: '' });
    } catch (error) {
      toast.error('Ошибка авторизации');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await shm_request('shm/v1/admin/cloud/user', {
        method: 'PUT',
        body: JSON.stringify(registerData),
      });
      
      toast.success('Регистрация успешна. Войдите в систему.');
      setShowLogin(true);
      setRegisterData({ login: '', password: '' });
    } catch (error) {
      toast.error('Ошибка регистрации');
    }
  };

  const handleLogout = async () => {
    try {
      await shm_request('shm/v1/admin/cloud/user/auth', {
        method: 'DELETE',
      });
    } catch (error) {
    } finally {
      localStorage.removeItem('cloud_auth');
      setIsAuthenticated(false);
      setCloudUser(null);
      toast.success('Вы вышли из системы');
    }
  };

  const inputStyles = {
    backgroundColor: 'var(--theme-input-bg)',
    borderColor: 'var(--theme-input-border)',
    color: 'var(--theme-input-text)',
  };

  const cardStyles = {
    backgroundColor: 'var(--theme-card-bg)',
    borderColor: 'var(--theme-card-border)',
    color: 'var(--theme-content-text)',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p style={{ color: 'var(--theme-content-text-muted)' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: 'var(--theme-content-text)' }}
          >
            <Cloud className="w-7 h-7" style={{ color: 'var(--theme-primary-color)' }} />
            SHM Cloud
          </h1>
        </div>

        <div className="max-w-md mx-auto mt-8">
          <div className="rounded-lg border p-6" style={cardStyles}>
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded transition-colors ${showLogin ? '' : 'opacity-60'}`}
                style={{
                  backgroundColor: showLogin ? 'var(--accent-primary)' : 'transparent',
                  color: showLogin ? 'var(--accent-text)' : 'var(--theme-content-text)',
                }}
              >
                <LogIn className="w-4 h-4 inline mr-2" />
                Вход
              </button>
              {/* <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded transition-colors ${!showLogin ? '' : 'opacity-60'}`}
                style={{
                  backgroundColor: !showLogin ? 'var(--accent-primary)' : 'transparent',
                  color: !showLogin ? 'var(--accent-text)' : 'var(--theme-content-text)',
                }}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Регистрация
              </button> */}
            </div>

            {showLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
                    Логин
                  </label>
                  <input
                    type="text"
                    value={loginData.login}
                    onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={inputStyles}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded font-medium"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-text)',
                  }}
                >
                  Войти
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
                    Логин
                  </label>
                  <input
                    type="text"
                    value={registerData.login}
                    onChange={(e) => setRegisterData({ ...registerData, login: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={inputStyles}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text)' }}>
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded border"
                    style={inputStyles}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded font-medium"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-text)',
                  }}
                >
                  Зарегистрироваться
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: 'var(--theme-content-text)' }}
        >
          <Cloud className="w-7 h-7" style={{ color: 'var(--theme-primary-color)' }} />
          SHM Cloud
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded flex items-center gap-2"
          style={{
            backgroundColor: 'var(--theme-button-secondary-bg)',
            color: 'var(--theme-button-secondary-text)',
            border: '1px solid var(--theme-button-secondary-border)',
          }}
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>

      {}
      <div className="rounded-lg border p-6 mb-6" style={cardStyles}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-input-bg)' }}>
              <UserPlus className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                {cloudUser?.login || 'test'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--theme-content-text-muted)' }}>
                Баланс {cloudUser?.balance || 0} ₽
              </p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="px-3 py-1.5 rounded flex items-center gap-2 text-sm font-medium btn-secondary"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-text)',
              }}
            >
              <Plus className="w-6 h-6" />
              Пополнить баланс
            </button>
          </div>
        </div>
      </div>
      
      {}
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--theme-content-text)' }}>
        Сервисы
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {TARIFFS.map((tariff) => {
          const Icon = tariff.icon;
          const buttonColor = tariff.id === 'free' ? '#fbbf24' : tariff.color;
          
          return (
            <div key={tariff.id} className="rounded-lg border overflow-hidden" style={cardStyles}>
              <div className="p-6 text-center" style={{ backgroundColor: tariff.color }}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="w-5 h-5" style={{ color: 'white' }} />
                  <h3 className="text-xl font-bold" style={{ color: 'white' }}>{tariff.name}</h3>
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: 'white' }}>
                  {tariff.price} <span className="text-lg">₽</span><span className="text-sm">/месяц</span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{tariff.description}</p>
              </div>
              <div className="p-6 space-y-3">
                {tariff.features.map((feature, index) => {
                  const featureText = getFeatureText(feature.status);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: getFeatureTextColor(feature.status) }}>
                        {feature.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs" style={{ color: featureText.color }}>
                          {featureText.text}
                        </span>
                        {getFeatureIcon(feature.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-6 pt-0">
                <button 
                  className="w-full py-3 rounded font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: buttonColor, color: 'white' }}
                >
                  ВЫБРАТЬ ТАРИФ
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </div>
  );
}

export default SHMCloud;
