import React, { useState } from 'react';
import './scss/Registration.scss';
import AuthModal from './AuthModal';

interface Testimonial {
  avatar: string;
  quote: string;
  author: string;
  role: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    avatar: "/avatars/liza.jpg",
    quote: 'Установила приложение по рекомендации знакомой и осталась в восторге! Много полезной информации, идей, как провести выходные не скучно и с пользой. Пользуюсь на постоянной основе 🫶🏻',
    author: 'Лизик',
    role: 'Student SPBGUAP',
    rating: 5
  },
  {
    avatar: "/avatars/misha.jpg",
    quote: 'Давно хотел найти приложением, в котором сочитается как удобность в использовании, так и огромное количество разных мест и идей, чтобы провести день с улыбкой на лице. Однозначно 5 звёзд🔥',
    author: 'Миша',
    role: 'Student SHE',
    rating: 5
  },
  {
    avatar: "/avatars/nikita.jpg",
    quote: 'Наконец-то появилось приложение, где можно найти все интересные маршруты в одном месте! В дизайне смогла разобраться даже моя бабушка! Спасибо разработчикам, бесспорно 5 звезд',
    author: 'Никита',
    role: 'NEDANO',
    rating: 5
  },
  {
    avatar: "/avatars/quick.jpg",
    quote: 'Отличное приложение для тех, кто хочет открыть для себя интересные культурные места! Удобный интерфейс, много информации, есть даже малоизвестные локации. Помогает классно проводить время в городе. После установки открыл для себя невероятное множество идей прогулок, замечательно! ❤️‍🔥',
    author: 'квиксик пинапять',
    role: 'Digital Nomad',
    rating: 5
  },
  {
    avatar: "/avatars/dania.jpg",
    quote: 'Приложение однозначно заслуживает вашего внимания. Приехал на выходные в Архангельск к своему другу, думал город такой себе. Но благодаря Культуре Гоу я увидел много чего крутого в этом, как казалось, скучном городе',
    author: 'Даниил',
    role: 'Student SHE',
    rating: 5
  }
];

const RegistrationPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const repeatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

  const handleMailButtonClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="registration-page">
      <div className="background-effects">
        {[...Array(50)].map((_, index) => (
          <div key={index} className="snowflake" />
        ))}
      </div>
      
      <div className="content">
        <div className="header">
          <div className="logo-container">
            <img 
              src="/image/logo.png" 
              alt="Логотип" 
              className="logo-image"
            />
          </div>
          <h1>Добро пожаловать в KulturaGo</h1>
        </div>

        <div className="buttons-block">
          <button className="continue-button apple-button">
            <img 
              src="/image/apple.png" 
              alt="Apple" 
              className="icon"
            />
            Продолжить с Apple
          </button>

          <button className="continue-button yandex-button">
            <img 
              src="/image/yandex.png" 
              alt="Yandex" 
              className="icon"
            />
            Продолжить с Яндекс
          </button>

          <button className="continue-button vk-button">
            <img 
              src="/image/vk.png" 
              alt="VK" 
              className="icon"
            />
            Продолжить с VK
          </button>

          <button 
            className="continue-button mail-button"
            onClick={handleMailButtonClick}
          >
            <img 
              src="/image/mail.png" 
              alt="Mail" 
              className="icon"
            />
            Продолжить с почтой
          </button>
        </div>

        <div className="policy-text">
          Продолжая, вы соглашаетесь с нашими Условиями использования и подтверждаете, 
          что прочитали Политику конфиденциальности
        </div>
      </div>

      <div className="testimonials-section">
        <div className="testimonials-carousel">
          <div className="testimonials-track">
            {repeatedTestimonials.map((testimonial, index) => (
              <div 
                key={`${testimonial.author}-${index}`}
                className="testimonial-card"
              >
                <div className="testimonial-header">
                  <div className="avatar">
                    <img src={testimonial.avatar} alt={testimonial.author} />
                  </div>
                  <div className="user-info">
                    <div className="author">{testimonial.author}</div>
                    <div className="rating">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? 'star-filled' : 'star-empty'}>
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 576 512" 
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                          </svg>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="quote">{testimonial.quote}</div>
                <div className="role">{testimonial.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default RegistrationPage;