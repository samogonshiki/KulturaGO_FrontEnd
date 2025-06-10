import React, { useState } from 'react';
import './PaymentCard.scss';
import { FaCreditCard } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface PaymentCardProps {
  onSubmit: (cardData: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  }) => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({ onSubmit }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const CardIcon = FaCreditCard as IconType;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    }

    setCardData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleCVCFocus = () => {
    setIsFlipped(true);
  };

  const handleCVCBlur = () => {
    setIsFlipped(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cardData);
  };

  return (
    <div className="payment-card-container">
      <div className={`payment-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-front">
          <div className="card-header">
             {/* @ts-ignore */}
            <CardIcon />
            <span className="card-type">VISA</span>
          </div>
          <div className="card-number">
            {cardData.number || '**** **** **** ****'}
          </div>
          <div className="card-details">
            <div className="card-holder">
              <span className="label">Card Holder</span>
              <span className="value">{cardData.name || 'FULL NAME'}</span>
            </div>
            <div className="card-expiry">
              <span className="label">Expires</span>
              <span className="value">{cardData.expiry || 'MM/YY'}</span>
            </div>
          </div>
        </div>
        <div className="card-back">
          <div className="magnetic-stripe"></div>
          <div className="cvc-container">
            <div className="cvc-label">CVC</div>
            <div className="cvc-value">{cardData.cvc || '***'}</div>
          </div>
        </div>
      </div>

      <form className="payment-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Номер карты</label>
          <input
            type="text"
            name="number"
            value={cardData.number}
            onChange={handleInputChange}
            maxLength={19}
            placeholder="**** **** **** ****"
            required
          />
        </div>
        <div className="form-group">
          <label>Имя владельца</label>
          <input
            type="text"
            name="name"
            value={cardData.name}
            onChange={handleInputChange}
            placeholder="IVAN IVANOV"
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Срок действия</label>
            <input
              type="text"
              name="expiry"
              value={cardData.expiry}
              onChange={handleInputChange}
              maxLength={5}
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="form-group">
            <label>CVC</label>
            <input
              type="text"
              name="cvc"
              value={cardData.cvc}
              onChange={handleInputChange}
              maxLength={3}
              placeholder="***"
              onFocus={handleCVCFocus}
              onBlur={handleCVCBlur}
              required
            />
          </div>
        </div>
        <button type="submit" className="submit-button">
          Оплатить
        </button>
      </form>
    </div>
  );
};

export default PaymentCard; 