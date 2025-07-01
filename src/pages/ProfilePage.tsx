import React, { useState } from 'react';
import './scss/ProfilePage.scss';

interface CardDetails {
  number: string;
  holder: string;
  expiry: string;
  type: 'visa' | 'mastercard';
}

const ProfilePage: React.FC = () => {
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '**** **** **** 1234',
    holder: 'Иван Иванов',
    expiry: '12/25',
    type: 'visa'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<CardDetails>(cardDetails);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSave = () => {
    setCardDetails(editedDetails);
    setIsEditing(false);
    setIsFlipped(false);
  };

  const handleCancel = () => {
    setEditedDetails(cardDetails);
    setIsEditing(false);
    setIsFlipped(false);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
      setIsCardExpanded(!isCardExpanded);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-section">
        <h2>Личная информация</h2>
        <div className="input-group">
          <label>Имя</label>
          <input type="text" defaultValue="Иван Иванов" />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" defaultValue="ivan@example.com" />
        </div>
        <div className="input-group">
          <label>Телефон</label>
          <input type="tel" defaultValue="+7 (999) 123-45-67" />
        </div>
        <button className="save-btn">Сохранить</button>
      </div>

      <div className="payment-section">
        <h2>Платежная информация</h2>
        <div className={`card-container ${isFlipped ? 'flipped' : ''}`}>
          <div className="card" onClick={handleCardClick}>
            <div className="card-front">
              <div className="card-type">
                <span className="material-symbols-rounded">
                  credit_card
                </span>
                {cardDetails.type.toUpperCase()}
              </div>
              <div className="card-chip">
                <span className="material-symbols-rounded">
                  deployed_code
                </span>
              </div>
              <div className="card-number">{cardDetails.number}</div>
              <div className="card-info">
                <div className="card-holder">
                  <div className="label">Card Holder</div>
                  <div className="value">{cardDetails.holder}</div>
                </div>
                <div className="card-expiry">
                  <div className="label">Expires</div>
                  <div className="value">{cardDetails.expiry}</div>
                </div>
              </div>
            </div>
            <div className="card-back">
              {!isEditing ? (
                <div className="card-details">
                  <div className="detail-row">
                    <span>Номер карты:</span>
                    <span>{cardDetails.number}</span>
                  </div>
                  <div className="detail-row">
                    <span>Владелец:</span>
                    <span>{cardDetails.holder}</span>
                  </div>
                  <div className="detail-row">
                    <span>Срок действия:</span>
                    <span>{cardDetails.expiry}</span>
                  </div>
                  <button 
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    <span className="material-symbols-rounded">edit</span>
                    Изменить
                  </button>
                </div>
              ) : (
                <div className="edit-form" onClick={(e) => e.stopPropagation()}>
                  <div className="input-group">
                    <label>Номер карты</label>
                    <input 
                      type="text" 
                      value={editedDetails.number}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        number: e.target.value
                      })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Владелец карты</label>
                    <input 
                      type="text"
                      value={editedDetails.holder}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        holder: e.target.value
                      })}
                    />
                  </div>
                  <div className="input-group">
                    <label>Срок действия</label>
                    <input 
                      type="text"
                      value={editedDetails.expiry}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        expiry: e.target.value
                      })}
                    />
                  </div>
                  <div className="button-group">
                    <button 
                      className="save-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave();
                      }}
                    >
                      Сохранить
                    </button>
                    <button 
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 