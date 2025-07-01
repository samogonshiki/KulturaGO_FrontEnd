import React, { useState } from 'react';
import './scss/PaymentCard.scss';

export type Card = {
  number: string;
  holder: string;
  expiry: string;
  type: 'visa' | 'mastercard';
};

interface PaymentCardProps {
  initial: Card;
  onSave(c: Card): void;
  onDelete(): void;
  onClose(): void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
                                                   initial, onSave, onDelete, onClose,
                                                 }) => {
  const [card, setCard] = useState<Card>(initial);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="card-container flipped" onClick={stop}>
          <div className="card">
            <div className="card-front">
              <div className="card-type">{card.type.toUpperCase()}</div>
              <div className="card-number">{card.number || '•••• •••• •••• ••••'}</div>
              <div className="card-info">
                <span>{card.holder || 'NAME'}</span>
                <span>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>

            <div className="card-back">
              <input
                  placeholder="Номер"
                  value={card.number}
                  onChange={e => setCard({ ...card, number: e.target.value })}
              />
              <input
                  placeholder="Владелец"
                  value={card.holder}
                  onChange={e => setCard({ ...card, holder: e.target.value })}
              />
              <input
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={e => setCard({ ...card, expiry: e.target.value })}
              />

              <div className="button-group">
                <button className="save-btn"   onClick={() => onSave(card)}>Сохранить</button>
                <button className="cancel-btn" onClick={onClose}>Отмена</button>
                <button className="delete-btn" onClick={onDelete}>Удалить</button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PaymentCard;