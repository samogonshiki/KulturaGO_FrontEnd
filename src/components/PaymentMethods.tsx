import React from 'react';
import './PaymentMethods.scss';

interface PaymentMethod {
  id: string;
  type: 'sbp' | 'card' | 'pay';
  bank?: string;
  icon: string;
  number?: string;
  isMain?: boolean;
}

const PaymentMethods: React.FC = () => {
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
      number: '5319',
      bank: 'MIR',
      icon: 'mir',
    },
    {
      id: '4',
      type: 'card',
      number: '9790',
      bank: 'MIR',
      icon: 'mir',
    },
    {
      id: '5',
      type: 'card',
      number: '4235',
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

  return (
    <div className="payment-methods">
      <div className="payment-methods__header">
        <div className="back-button">
          <span className="material-symbols-rounded">arrow_back</span>
        </div>
        <h1>Способы оплаты</h1>
        <div className="edit-button">
          Изменить
        </div>
      </div>

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
};

export default PaymentMethods; 