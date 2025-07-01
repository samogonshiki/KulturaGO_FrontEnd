import React, { useEffect, useState, useRef, useCallback } from 'react';
import './scss/InfoFrame.scss';
import { Link } from 'react-router-dom';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: 'tour',
    title: "Онлайн экскурсии",
    description: "Выбирайте готовые маршруты с аудиогидом и исследуйте город в своем темпе"
  },
  {
    icon: 'theater_comedy',
    title: "Билеты и события",
    description: "Покупайте билеты в театры, музеи, на концерты и культурные мероприятия"
  },
  {
    icon: 'recommend',
    title: "Умные рекомендации",
    description: "Получайте персональные рекомендации на основе ваших интересов и предпочтений"
  },
  {
    icon: 'route',
    title: "Авторские маршруты",
    description: "Уникальные трекинг-маршруты от профессиональных гидов"
  },
  {
    icon: 'filter_alt',
    title: "Удобные фильтры",
    description: "Сортировка по стоимости, доступности и возрастным ограничениям"
  },
  {
    icon: 'history_edu',
    title: "Культурное обогащение",
    description: "Погружайтесь в историю и культуру через интерактивные экскурсии"
  }
];

const InfoFrame: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [siteLinkHidden, setSiteLinkHidden] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < lastScrollY) {
      setIsHidden(false);
    } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setIsHidden(true);
    }
    
    if (currentScrollY > 0) {
      setSiteLinkHidden(true);
    } else {
      setSiteLinkHidden(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    setVisible(true);
    
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              entry.target.classList.add('visible');
            });
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '20px'
      }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    const featureInterval = setInterval(() => {
      if (!document.hidden) {
        setCurrentFeature(prev => (prev + 1) % features.length);
      }
    }, 4000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchmove', onScroll);
      clearInterval(featureInterval);
      observer.disconnect();
    };
  }, [handleScroll]);

  const handleFeatureHover = (index: number) => {
    setCurrentFeature(index);
  };

  return (
    <>
      <div 
        className={`info-frame-container ${visible ? 'visible' : ''} ${isHidden ? 'hidden' : ''}`}
        style={{ height: '100vh' }}
      >
        <div className="background-effects">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle" 
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`
              }}
            />
          ))}
        </div>

        <div className="info-content">
          <div className="hero-section">
            <h1 className="main-title">
              Ваш путеводитель в мир <span className="highlight">культуры и искусства</span>
            </h1>
            <p className="subtitle">
              Исследуйте город через интерактивные экскурсии, посещайте культурные события и получайте персональные рекомендации
            </p>
            <div className="hero-buttons">
              <Link to="/registration" className="cta-button primary">
                <span className="material-symbols-rounded">how_to_reg</span>
                Начать экскурсию
              </Link>
              <button 
                className="cta-button" 
                onClick={() => {
                  const featuresSection = document.querySelector('.features-section');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="material-symbols-rounded">info</span>
                Узнать больше
              </button>
            </div>
          </div>

          <div className="features-section">
            <h2 className="section-title animate-on-scroll">Возможности приложения</h2>
            
            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`feature-card animate-on-scroll ${index === currentFeature ? 'highlighted' : ''}`}
                  onMouseEnter={() => handleFeatureHover(index)}
                  onMouseLeave={() => setCurrentFeature(0)}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  <div className="feature-icon">
                    <span className="material-symbols-rounded">{feature.icon}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="showcase-section">
            <div className="showcase-content">
              <h2 className="section-title animate-on-scroll">Как это работает</h2>
              <div className="steps">
                <div className="step animate-on-scroll" style={{ '--index': 0 } as React.CSSProperties}>
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h3>Выберите экскурсию</h3>
                    <p>Просмотрите каталог готовых маршрутов от профессиональных гидов или создайте свой собственный путь</p>
                  </div>
                </div>
                <div className="step animate-on-scroll" style={{ '--index': 1 } as React.CSSProperties}>
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h3>Отправляйтесь в путь</h3>
                    <p>Следуйте по маршруту в своем темпе, слушая увлекательный аудиогид и узнавая историю каждого места</p>
                  </div>
                </div>
                <div className="step animate-on-scroll" style={{ '--index': 2 } as React.CSSProperties}>
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h3>Исследуйте и бронируйте</h3>
                    <p>Находите интересные события поблизости, покупайте билеты в театры и музеи со скидкой</p>
                  </div>
                </div>
                <div className="step animate-on-scroll" style={{ '--index': 3 } as React.CSSProperties}>
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <h3>Получайте рекомендации</h3>
                    <p>Наша система подберет для вас самые интересные маршруты и события на основе ваших предпочтений</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="showcase-image">
              <div className="demo-interface">
                <div className="demo-overlay">
                  <div className="demo-screen">
                    <div className="demo-header">
                      <span className="material-symbols-rounded">videocam</span>
                      <h4>Превью приложения</h4>
                    </div>
                    <div className="demo-content">
                      <div className="demo-map">
                        <div className="video-container">
                          <div className="video-placeholder">
                            <div className="play-button">
                              <span className="material-symbols-rounded">play_arrow</span>
                            </div>
                            <p>Видео демонстрация функций приложения скоро будет доступна</p>
                          </div>
                          <div className="video-overlay">
                            <div className="overlay-decoration top-left"></div>
                            <div className="overlay-decoration top-right"></div>
                            <div className="overlay-decoration bottom-left"></div>
                            <div className="overlay-decoration bottom-right"></div>
                          </div>
                          <div className="video-controls">
                            <div className="progress-bar">
                              <div className="progress"></div>
                            </div>
                            <div className="control-buttons">
                              <button>
                                <span className="material-symbols-rounded">volume_up</span>
                              </button>
                              <button>
                                <span className="material-symbols-rounded">fullscreen</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2 className="section-title animate-on-scroll">О приложении</h2>
            <div className="about-content">
              <div className="about-card animate-on-scroll" style={{ '--index': 0 } as React.CSSProperties}>
                <h3>
                  <span className="material-symbols-rounded">auto_awesome</span>
                  Персонализация
                </h3>
                <p>Наша система рекомендаций учится на ваших предпочтениях. Чем больше вы используете приложение, тем точнее становятся предложения. Любите театр? Получайте первыми информацию о премьерах и специальных показах.</p>
              </div>
              <div className="about-card animate-on-scroll" style={{ '--index': 1 } as React.CSSProperties}>
                <h3>
                  <span className="material-symbols-rounded">diversity_3</span>
                  Доступность
                </h3>
                <p>Мы заботимся о каждом пользователе. Используйте фильтры по возрастным ограничениям, выбирайте бесплатные или платные мероприятия, находите места и маршруты, доступные для всех категорий посетителей.</p>
              </div>
              <div className="about-card animate-on-scroll" style={{ '--index': 2 } as React.CSSProperties}>
                <h3>
                  <span className="material-symbols-rounded">verified_user</span>
                  Экспертный контент
                </h3>
                <p>Все маршруты создаются профессиональными гидами и историками. Каждая экскурсия проходит тщательную проверку, чтобы предоставить вам только достоверную и интересную информацию.</p>
              </div>
            </div>
          </div>

          <footer className="app-footer">
            <div className="call-to-action">
              <h2>Готовы к культурному путешествию?</h2>
              <Link to="/registration" className="cta-button primary">
                <span className="material-symbols-rounded">how_to_reg</span>
                Начать экскурсию
              </Link>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h3>Приложение</h3>
                <a href="#">Возможности</a>
                <a href="#">Обновления</a>
                <a href="#">API</a>
              </div>
              <div className="link-group">
                <h3>Поддержка</h3>
                <a href="#">Руководство</a>
                <a href="#">FAQ</a>
                <a href="#">Контакты</a>
              </div>
              <div className="link-group">
                <h3>Правовая информация</h3>
                <a href="#">Условия использования</a>
                <a href="#">Конфиденциальность</a>
                <a href="#">Лицензии</a>
              </div>
            </div>
            <div className="copyright">
              © 2024 Travel App. Все права защищены.
            </div>
          </footer>
        </div>
      </div>
      

        
    </>
  );
};

export default InfoFrame;