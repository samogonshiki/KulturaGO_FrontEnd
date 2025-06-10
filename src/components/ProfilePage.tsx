import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.scss';

interface ProfilePageProps {
  profileImage: string;
  onUpdateImage: (newImage: string) => void;
}

interface Ticket {
  id: number;
  eventName: string;
  date: string;
  time: string;
  location: string;
  price: string;
  status: 'active' | 'used' | 'cancelled';
  qrCode: string;
}

interface PaymentMethod {
  id: string;
  type: 'sbp' | 'card' | 'pay';
  bank?: string;
  icon: string;
  number?: string;
  isMain?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profileImage, onUpdateImage }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const stats = [
    { icon: 'museum', value: '24', label: 'Музеев посещено' },
    { icon: 'stars', value: '4.8', label: 'Рейтинг' },
    { icon: 'military_tech', value: 'Эксперт', label: 'Статус' }
  ];

  const tickets: Ticket[] = [
    {
      id: 1,
      eventName: 'Выставка Ван Гога',
      date: '2024-04-15',
      time: '14:00',
      location: 'Третьяковская галерея',
      price: '2500₽',
      status: 'active',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    },
    {
      id: 2,
      eventName: 'Экскурсия в Пушкинский музей',
      date: '2024-04-20',
      time: '11:30',
      location: 'Пушкинский музей',
      price: '1800₽',
      status: 'active',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    },
    {
      id: 3,
      eventName: 'Выставка современного искусства',
      date: '2024-03-10',
      time: '16:00',
      location: 'Центр современного искусства',
      price: '2000₽',
      status: 'used',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'sbp',
      bank: 'Яндекс',
      icon: 'yandex',
    },
    {
      id: '2',
      type: 'sbp',
      bank: 'Т-Банк (Тинькофф)',
      icon: 'tinkoff',
    },
    {
      id: '3',
      type: 'card',
      number: '5555',
      bank: 'MIR',
      icon: 'mir',
      isMain: true,
    },
    {
      id: '4',
      type: 'card',
      number: '4444',
      bank: 'MIR',
      icon: 'mir',
    },
    {
      id: '5',
      type: 'card',
      number: '2222',
      bank: 'MasterCard',
      icon: 'mastercard',
    },
    {
      id: '6',
      type: 'pay',
      bank: 'Карта Пэй',
      icon: 'pay',
    }
  ];

  const securitySettings = [
    {
      title: 'Двухфакторная аутентификация',
      description: 'Дополнительный уровень защиты вашего аккаунта',
      icon: 'security',
      enabled: true
    },
    {
      title: 'Уведомления о входе',
      description: 'Получайте уведомления о входе в аккаунт с новых устройств',
      icon: 'notifications',
      enabled: true
    },
    {
      title: 'Сессии',
      description: 'Управление активными сессиями',
      icon: 'devices',
      enabled: false
    }
  ];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdateImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'used':
        return '#9E9E9E';
      case 'cancelled':
        return '#FF3B30';
      default:
        return '#6C5DD3';
    }
  };

  const getStatusText = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'used':
        return 'Использован';
      case 'cancelled':
        return 'Отменён';
      default:
        return status;
    }
  };

  const handlePaymentMethodsClick = () => {
    navigate('/payment-methods');
  };

  const renderPaymentMethods = () => (
    <div className="payment-methods">
      <div className="payment-methods__list">
        {paymentMethods.map((method) => (
          <div key={method.id} className="payment-method-item">
            <div className={`payment-icon ${method.icon}`}>
              {method.type === 'sbp' && (
                <span className="material-symbols-rounded">
                  {method.icon === 'yandex' ? 'currency_ruble' : 'account_balance'}
                </span>
              )}
              {method.type === 'card' && (
                <span className="material-symbols-rounded">credit_card</span>
              )}
              {method.type === 'pay' && (
                <span className="material-symbols-rounded">wallet</span>
              )}
            </div>
            <div className="payment-info">
              <div className="payment-label">
                {method.type === 'sbp' ? 'Система быстрых платежей' : 
                 method.type === 'card' ? 'Банковская карта' : 'Электронный кошелек'}
              </div>
              <div className="payment-name">
                {method.type === 'sbp' ? `СБП • ${method.bank}` : 
                 method.type === 'card' ? `${method.bank} •• ${method.number}` :
                 method.bank}
              </div>
            </div>
            {method.isMain && <div className="main-badge">Основная</div>}
          </div>
        ))}

        <div className="payment-method-item add-new">
          <div className="payment-icon add">
            <span className="material-symbols-rounded">add</span>
          </div>
          <div className="payment-info">
            <div className="payment-name">Добавить карту</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profileImage} alt="Profile" />
          <label className="change-avatar-btn">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <span className="material-symbols-rounded">photo_camera</span>
          </label>
        </div>
        
        <div className="profile-info">
          <div className="profile-name">
            <h1>Фетюков Никита Сергеевич</h1>
            <p>Путешественник</p>
          </div>

          <div className="profile-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="material-symbols-rounded">{stat.icon}</span>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <span className="material-symbols-rounded">person</span>
            Личные данные
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <span className="material-symbols-rounded">local_activity</span>
            Билеты
          </button>
          <button 
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <span className="material-symbols-rounded">credit_card</span>
            Способы оплаты
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="material-symbols-rounded">lock</span>
            Безопасность
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'personal' && (
            <div className="personal-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="material-symbols-rounded">mail</span>
                  <div className="info-content">
                    <label>Email</label>
                    <input type="email" defaultValue="ivan@example.com" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="info-item">
                  <span className="material-symbols-rounded">phone</span>
                  <div className="info-content">
                    <label>Телефон</label>
                    <input type="tel" defaultValue="+7 (999) 123-45-67" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="info-item">
                  <span className="material-symbols-rounded">location_on</span>
                  <div className="info-content">
                    <label>Город</label>
                    <input type="text" defaultValue="Архангельск" readOnly={!isEditing} />
                  </div>
                </div>
                <div className="info-item">
                  <span className="material-symbols-rounded">cake</span>
                  <div className="info-content">
                    <label>Дата рождения</label>
                    <input type="date" defaultValue="1990-01-01" readOnly={!isEditing} />
                  </div>
                </div>
              </div>

              <div className="actions">
                {!isEditing ? (
                  <button 
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="material-symbols-rounded">edit</span>
                    Редактировать
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="save-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      <span className="material-symbols-rounded">save</span>
                      Сохранить
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      <span className="material-symbols-rounded">close</span>
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="tickets-info">
              <div className="section-header">
                <h2>Мои билеты</h2>
              </div>
              
              <div className="tickets-grid">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-item">
                    <div className="ticket-header">
                      <h3>{ticket.eventName}</h3>
                      <span 
                        className="ticket-status"
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    
                    <div className="ticket-details">
                      <div className="detail-row">
                        <span className="material-symbols-rounded">calendar_month</span>
                        <p>{new Date(ticket.date).toLocaleDateString('ru-RU', { 
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                      <div className="detail-row">
                        <span className="material-symbols-rounded">schedule</span>
                        <p>{ticket.time}</p>
                      </div>
                      <div className="detail-row">
                        <span className="material-symbols-rounded">location_on</span>
                        <p>{ticket.location}</p>
                      </div>
                      <div className="detail-row">
                        <span className="material-symbols-rounded">payments</span>
                        <p>{ticket.price}</p>
                      </div>
                    </div>

                    {ticket.status === 'active' && (
                      <div className="ticket-actions">
                        <img 
                          src={ticket.qrCode} 
                          alt="QR код билета" 
                          className="ticket-qr"
                        />
                        <button className="download-btn">
                          <span className="material-symbols-rounded">download</span>
                          Скачать билет
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && renderPaymentMethods()}

          {activeTab === 'security' && (
            <div className="security-info">
              <div className="security-settings">
                <h2>Настройки безопасности</h2>
                
                <div className="settings-grid">
                  {securitySettings.map((setting, index) => (
                    <div key={index} className="setting-item">
                      <div className="setting-icon">
                        <span className="material-symbols-rounded">{setting.icon}</span>
                      </div>
                      <div className="setting-content">
                        <h3>{setting.title}</h3>
                        <p>{setting.description}</p>
                      </div>
                      <div className="setting-action">
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={setting.enabled}
                            onChange={() => {}}
                          />
                          <span className="slider" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="password-section">
                  <h2>Изменение пароля</h2>
                  <div className="password-form">
                    <div className="form-group">
                      <label>Текущий пароль</label>
                      <input type="password" placeholder="Введите текущий пароль" />
                    </div>
                    <div className="form-group">
                      <label>Новый пароль</label>
                      <input type="password" placeholder="Введите новый пароль" />
                    </div>
                    <div className="form-group">
                      <label>Подтверждение пароля</label>
                      <input type="password" placeholder="Подтвердите новый пароль" />
                    </div>
                    <button className="change-password-btn">
                      <span className="material-symbols-rounded">lock_reset</span>
                      Изменить пароль
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 