import { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { shm_request } from '../lib/shm_request';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export interface SubscriptionInfo {
  auto_renewal: boolean;
  expire: string;
  next: number;
  period: number;
  price: number;
  service_id: number;
  status: string;
  tg_url?: string;
}

export interface SubscriptionPlan {
  name: string;
  next?: number;
  period: number;
  price: number;
  price_next?: number;
  service_id: number;
}

function Subscription() {
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [orderingSubscription, setOrderingSubscription] = useState(false);

  const cardStyles = {
    backgroundColor: 'var(--theme-card-bg)',
    borderColor: 'var(--theme-card-border)',
    color: 'var(--theme-content-text)',
  };

  const inputStyles = {
    backgroundColor: 'var(--theme-input-bg)',
    borderColor: 'var(--theme-input-border)',
    color: 'var(--theme-content-text)',
  };

  useEffect(() => {
    loadSubscriptionInfo();
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionInfo = async () => {
    setLoading(true);
    setSubscriptionError('');
    setShowSubscriptionForm(false);

    try {
      const response = await shm_request('shm/v1/admin/cloud/proxy/service/sub/get');
      
      if (response.status === 200 || response) {
        const data = response.data || response;
        setSubscriptionInfo(data);
        setShowSubscriptionForm(false);
      }
    } catch (error: any) {
      if (error.status === 404 || error.response?.status === 404) {
        setShowSubscriptionForm(true);
        setSubscriptionInfo(null);
      } else {
        setSubscriptionError('Ошибка загрузки информации о подписке');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionPlans = async () => {
    try {
      const response = await shm_request('shm/v1/admin/cloud/proxy/service/sub/list');
      const plans = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      setSubscriptionPlans(plans);
    } catch (error) {
      console.error('Ошибка загрузки планов подписки:', error);
    }
  };

  const orderSubscription = async (serviceId: number) => {
    if (!serviceId) {
      return;
    }

    setOrderingSubscription(true);
    setSubscriptionError('');

    try {
      const response = await shm_request('shm/v1/admin/cloud/proxy/service/sub/reg', {
        method: 'POST',
        body: JSON.stringify({ service_id: serviceId }),
      });

      if (response.status === 200 || response) {
        toast.success('Подписка успешно оформлена');
        await loadSubscriptionInfo();
      }
    } catch (error: any) {
      const errorMessage = error.data?.error || error.response?.data?.error || 'Ошибка оформления подписки';
      setSubscriptionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOrderingSubscription(false);
    }
  };

  const updateRenewalPeriod = async (serviceId: number) => {
    try {
      await shm_request('shm/v1/admin/cloud/proxy/service/sub/renewal', {
        method: 'POST',
        body: JSON.stringify({ service_id: serviceId }),
      });
      toast.success('Период продления обновлен');
        loadSubscriptionInfo();
        loadSubscriptionPlans();
    } catch (error) {
      console.error('Ошибка обновления периода продления:', error);
      toast.error('Ошибка обновления периода продления');
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 
          className="text-2xl font-bold flex items-center gap-3"
          style={{ color: 'var(--theme-content-text)' }}
        >
          <CreditCard className="w-7 h-7" style={{ color: 'var(--theme-primary-color)' }} />
          Подписка
        </h1>
        <Link 
          to="/cloud"
          className="px-4 py-2 rounded flex items-center gap-2"
          style={{
            backgroundColor: 'var(--theme-button-secondary-bg)',
            color: 'var(--theme-button-secondary-text)',
            border: '1px solid var(--theme-button-secondary-border)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>
      </div>

      {/* Информация о преимуществах подписки */}
      <div className="rounded-lg border p-6 mb-6" style={{...cardStyles, borderColor: 'var(--accent-info)'}}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-content-text)' }}>
          Преимущества подписки
        </h3>
        <p className="mb-3" style={{ color: 'var(--theme-content-text)' }}>
          Приобретая подписку Вы получаете:
        </p>
        <ul className="space-y-2" style={{ color: 'var(--theme-content-text-muted)' }}>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-success)' }} />
            <span>Техническую поддержку от интеграторов и разработчиков SHM</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-success)' }} />
            <span>Доступ в закрытую группу Telegram для получения поддержки в режиме online</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-success)' }} />
            <span>Скидку 10% и бесплатные обновления для Платежных систем и Шаблонов</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-success)' }} />
            <span>Работу с промокодами</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-success)' }} />
            <span>Конвертер валют для проведения операций в иностранных валютах и приема платежей Telegram (Звезды)</span>
          </li>
        </ul>
      </div>

      {/* Информация о существующей подписке */}
      {subscriptionInfo && (
        <div className="rounded-lg border p-6 mb-6" style={cardStyles}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-content-text)' }}>
            Информация о подписке
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
                  Подписка оплачена до:
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'var(--theme-content-text)' }}>{subscriptionInfo.expire}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
                  Статус:
                </label>
                <div className="flex items-center gap-2">
                  {subscriptionInfo.status === 'ACTIVE' ? (
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent-success)' }} />
                  ) : (
                    <XCircle className="w-4 h-4" style={{ color: 'var(--accent-danger)' }} />
                  )}
                  <span style={{ 
                    color: subscriptionInfo.status === 'ACTIVE' 
                      ? 'var(--accent-success)' 
                      : 'var(--accent-danger)' 
                  }}>
                    {subscriptionInfo.status}
                  </span>
                </div>
              </div>
            </div>

            {subscriptionInfo.tg_url && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
                  Ссылка для вступления в группу:
                </label>
                <a
                  href={subscriptionInfo.tg_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <ExternalLink className="w-4 h-4" />
                  {subscriptionInfo.tg_url}
                </a>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
                Период продления подписки:
              </label>
              <select
                className="w-full px-3 py-2 rounded border"
                style={inputStyles}
                value={subscriptionInfo.next}
                onChange={(e) => updateRenewalPeriod(Number(e.target.value))}
              >
                <option value={-1}>Не продлевать</option>
                {subscriptionPlans.map((plan) => (
                  <option key={plan.service_id} value={plan.service_id}>
                    {plan.name} - {plan.price} руб.
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Форма заказа подписки */}
      {showSubscriptionForm && (
        <div className="rounded-lg border p-6 mb-6" style={cardStyles}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-content-text)' }}>
            Оформление подписки
          </h3>
          
          {subscriptionError && (
            <div className="p-4 rounded mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)' }}>
              {subscriptionError}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--theme-content-text)' }}>
              Выберите период:
            </label>
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.service_id}
                className="p-4 rounded border cursor-pointer transition-all"
                style={{
                  ...cardStyles,
                  borderColor: selectedPlan === plan.service_id ? 'var(--accent-primary)' : 'var(--theme-card-border)',
                  backgroundColor: selectedPlan === plan.service_id ? 'rgba(59, 130, 246, 0.1)' : cardStyles.backgroundColor,
                }}
                onClick={() => setSelectedPlan(plan.service_id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={selectedPlan === plan.service_id}
                    onChange={() => setSelectedPlan(plan.service_id)}
                    className="w-4 h-4"
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color: 'var(--theme-content-text)' }}>
                        {plan.name}
                      </span>
                      <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {plan.price} ₽
                      </span>
                    </div>
                    {plan.price_next && (
                      <p className="text-sm mt-1" style={{ color: 'var(--theme-content-text-muted)' }}>
                        (далее {plan.price_next} руб. в месяц при заблаговременной оплате)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => selectedPlan && orderSubscription(selectedPlan)}
              disabled={!selectedPlan || orderingSubscription}
              className="px-6 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent-success)',
                color: 'white',
              }}
            >
              {orderingSubscription ? 'Оформление...' : 'Оформить подписку'}
            </button>
          </div>
        </div>
      )}

      {/* Отображение ошибки загрузки */}
      {subscriptionError && !showSubscriptionForm && (
        <div className="rounded-lg border p-6" style={cardStyles}>
          <div className="p-4 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-warning)' }}>
            <strong>Ошибка загрузки:</strong> {subscriptionError}
          </div>
        </div>
      )}
    </div>
  );
}

export default Subscription;
