import React, { useState } from 'react';
import './scss/PaymentMethods.scss';

export interface PaymentMethod {
  id: string;
  type: 'sbp' | 'card' | 'pay';
  bank?: string;
  icon: string;
  number?: string;
  isMain?: boolean;
}

interface Props {
  initial:  PaymentMethod[];
  onChange: (list: PaymentMethod[]) => void;
}


const PaymentMethods: React.FC<Props> = ({ initial, onChange }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);

  const update = (next: PaymentMethod[]) => {
    setMethods(next);
    onChange(next);
  };

  const setMain = (id: string) =>
      update(methods.map(m => ({ ...m, isMain: m.id === id })));

  const remove = (id: string) =>
      update(methods.filter(m => m.id !== id));

  const addCard = () => {
    const last4 = prompt('Введите 4 последние цифры карты')?.trim();
    if (!last4 || !/^\d{4}$/.test(last4)) return;

    update([
      ...methods,
      {
        id:     Date.now().toString(),
        type:   'card',
        bank:   'MIR',
        icon:   'mir',
        number: last4,
      },
    ]);
  };

  return (
      <div className="payment-methods">
        <h2>Способы оплаты</h2>

        <div className="payment-methods__list">
          {methods.map(m => (
              <div key={m.id} className="payment-method-item">
                <div className={`payment-icon ${m.icon}`}>
              <span className="material-symbols-rounded">
                {m.type === 'card' ? 'credit_card'
                    : m.type === 'sbp' ? 'account_balance' : 'wallet'}
              </span>
                </div>

                <div className="payment-info">
                  <div className="payment-name">
                    {m.type === 'sbp'
                        ? `СБП • ${m.bank}`
                        : m.type === 'card'
                            ? `${m.bank} •• ${m.number}`
                            : m.bank}
                  </div>
                </div>

                {m.isMain && <div className="main-badge">Основная</div>}

                <div className="actions">
                  {!m.isMain && (
                      <button title="Сделать основной" onClick={() => setMain(m.id)}>★</button>
                  )}
                  <button title="Удалить" onClick={() => remove(m.id)}>✕</button>
                </div>
              </div>
          ))}

          <div className="payment-method-item add-new" onClick={addCard}>
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