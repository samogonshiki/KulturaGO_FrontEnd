import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaHeart, FaInfoCircle, FaStar, FaUser, FaMapMarkerAlt, FaVideo } from 'react-icons/fa';
import { IconType } from 'react-icons';
import '../scss/ExcursionModal.scss';
import { useNavigate } from 'react-router-dom';

interface Review {
  id: number;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface ExcursionModalProps {
  isOpen: boolean;
  onClose: () => void;
  excursion: {
    id: string;
    title: string;
    image: string;
    gallery: string[];
    description: string;
    address: string;
    price: string;
  };
}

export const ExcursionModal: React.FC<ExcursionModalProps> = ({ isOpen, onClose, excursion }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [isClosing, setIsClosing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const HeartIcon = FaHeart as IconType;
  const TimesIcon = FaTimes as IconType;
  const InfoIcon = FaInfoCircle as IconType;
  const StarIcon = FaStar as IconType;
  const UserIcon = FaUser as IconType;
  const MapIcon = FaMapMarkerAlt as IconType;
  const VideoIcon = FaVideo as IconType;

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const bottomBlock = document.querySelector('.bottom-navigation');
    const grayBlock = document.querySelector('.gray-block');

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.classList.add('hidden');
      if (bottomBlock) bottomBlock.classList.add('hidden');
      if (grayBlock) grayBlock.classList.add('hidden');
    } else {
      document.body.style.overflow = 'unset';
      if (navbar) navbar.classList.remove('hidden');
      if (bottomBlock) bottomBlock.classList.remove('hidden');
      if (grayBlock) grayBlock.classList.remove('hidden');
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    const navbar = document.querySelector('.navbar');
    const bottomBlock = document.querySelector('.bottom-navigation');
    const grayBlock = document.querySelector('.gray-block');
    
    document.body.style.overflow = 'unset';
    if (navbar) navbar.classList.remove('hidden');
    if (bottomBlock) bottomBlock.classList.remove('hidden');
    if (grayBlock) grayBlock.classList.remove('hidden');

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Add logic to save to favorites
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      userName: 'Анна',
      rating: 5,
      text: 'Замечательная экскурсия! Очень познавательно и интересно.',
      date: '2024-03-15'
    },
    {
      id: 2,
      userName: 'Михаил',
      rating: 4,
      text: 'Хорошая организация, но хотелось бы больше времени на фотографии.',
      date: '2024-03-10'
    }
  ]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReviewForm(false);
    setNewReview({ rating: 5, text: '' });
  };

  const handleShowMap = () => {
    console.log('Show map for:', excursion.address);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (excursion.gallery?.length ?? 0) - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (excursion.gallery?.length ?? 0) - 1 : prev - 1
    );
  };

  if (!isOpen) return null;

  return (
    <div className={`excursion-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`excursion-modal ${isClosing ? 'closing' : ''}`}>
        <div className="modal-actions">
          <button 
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            aria-label="Add to favorites"
          >
             {/* @ts-ignore */}
            <HeartIcon />
          </button>
          <button 
            onClick={handleClose}
            aria-label="Close modal"
          >
             {/* @ts-ignore */}
            <TimesIcon />
          </button>
        </div>

        <div className="modal-header">
          <h2>{excursion.title}</h2>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
               {/* @ts-ignore */}
              <InfoIcon />
              Информация
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
               {/* @ts-ignore */}
              <StarIcon />
              Отзывы
            </button>
          </div>
        </div>

        <div className="modal-content">
          <div className={`info-content ${activeTab === 'info' ? 'active' : ''}`}>
            {!imageError && excursion.image && (
              <div className="excursion-image">
                <img 
                  src={excursion.image} 
                  alt={excursion.title}
                  onError={handleImageError}
                />
              </div>
            )}
            
            {excursion.gallery && excursion.gallery.length > 0 && (
              <div className="gallery-section">
                <h3>Фотогалерея</h3>
                <div className="gallery-container">
                  <button className="gallery-nav prev" onClick={handlePrevImage}>
                    &#10094;
                  </button>
                  <div className="gallery-main">
                    <img 
                      src={excursion.gallery[currentImageIndex]} 
                      alt={`${excursion.title} - фото ${currentImageIndex + 1}`}
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                  </div>
                  <button className="gallery-nav next" onClick={handleNextImage}>
                    &#10095;
                  </button>
                  <div className="gallery-thumbnails">
                    {excursion.gallery.map((photo, index) => (
                      <div 
                        key={index}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={photo} 
                          alt={`Миниатюра ${index + 1}`}
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="description">{excursion.description}</p>
            <div className="details">
              <p>Адрес: {excursion.address}</p>
              <p>Стоимость: {excursion.price}</p>
            </div>
            <div className="action-buttons">
              <div className="main-action">
                <button className="buy-button">
                   {/* @ts-ignore */}
                  <StarIcon />
                  Купить билет
                </button>
              </div>
              <div className="secondary-actions">
                <button className="map-button" onClick={handleShowMap}>
                   {/* @ts-ignore */}
                  <MapIcon />
                  Показать на карте
                </button>
                <button className="online-button" onClick={() => navigate('/online')}>
                   {/* @ts-ignore */}
                  <VideoIcon />
                  Онлайн-экскурсия
                </button>
              </div>
            </div>
          </div>

          <div className={`reviews-content ${activeTab === 'reviews' ? 'active' : ''}`}>
            <div className="reviews-header">
              <h3>Отзывы посетителей</h3>
              {!showReviewForm && (
                <button 
                  className="add-review-button"
                  onClick={() => setShowReviewForm(true)}
                >
                  Оставить отзыв
                </button>
              )}
            </div>

            {showReviewForm && (
              <form className="review-form" onSubmit={handleSubmitReview}>
                <div className="rating-input">
                  <label>Ваша оценка:</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star ${star <= newReview.rating ? 'active' : ''}`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      >
                         {/* @ts-ignore */}
                        <StarIcon />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Поделитесь своими впечатлениями..."
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  required
                />
                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    Отправить
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="user-info">
                       {/* @ts-ignore */}
                      <UserIcon className="user-icon" />
                      <span className="user-name">{review.userName}</span>
                    </div>
                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                         /* @ts-ignore */
                        <StarIcon
                          key={star}
                          className={star <= review.rating ? 'star active' : 'star'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-text">{review.text}</p>
                  <span className="review-date">{review.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcursionModal; 