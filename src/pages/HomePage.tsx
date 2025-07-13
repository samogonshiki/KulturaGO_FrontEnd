// src/components/HomePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/scss/HomePage.scss';
import { FaMapMarkerAlt, FaBuilding, FaClock, FaCalendar } from 'react-icons/fa';
import { FiSearch, FiCamera } from 'react-icons/fi';
import { IconType } from 'react-icons';
import ExcursionModal from '../components/modal/ExcursionModal';

interface HomePageProps {
  profileImage: string | null;
}

interface Event {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  price: string;
  category: string;
  image: string;
  description: string;
}

interface RecommendationItem {
  id: number;
  title: string;
  type: string;
  count: string;
  address: string;
  color: string;
  description?: string;
  price?: string;
  image: string;
  gallery?: string[];
}

const DEFAULT_AVATAR = '/avatars/def.png';

const HomePage: React.FC<HomePageProps> = ({ profileImage }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExcursion, setSelectedExcursion] = useState<RecommendationItem | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Переход в профиль
  const goToProfile = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate('/profile');
    }, 300);
  };

  // Открыть диалог выбора файла
  const pickAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Обработчик загрузки нового аватара
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem('profileImage', dataUrl);
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const categories = [
    'Все',
    'Музеи',
    'Экскурсии',
    'Концерты',
    'Образование',
    'Театры',
    'Кинотеатры'
  ];

  const events: Event[] = [
    {
      id: 1,
      title: 'Гамлет',
      location: 'Архангельский театр драмы',
      date: '25 мая 2024',
      time: '19:00',
      price: '1000 ₽',
      category: 'Театры',
      image: '/image/events/6.jpg',
      description: 'Классическая постановка величайшей трагедии Уильяма Шекспира'
    },
    {
      id: 2,
      title: 'История Севера',
      location: 'Гостиные дворы',
      date: '20 мая 2024',
      time: '16:30',
      price: '400 ₽',
      category: 'Музеи',
      image: '/image/events/7.jpg',
      description: 'Экскурсия по главному историческому музею Архангельска'
    }
  ];

  const recommendations: RecommendationItem[] = [
    {
      id: 1,
      title: 'П. Чумбарова-Лучинского',
      type: 'Экскурсии',
      count: '16',
      address: 'Проспект Чумбарова-Лучинского',
      color: '#A4B494',
      description: 'Пешеходная улица в историческом центре Архангельска, известная своей уникальной деревянной архитектурой.',
      price: 'от 400 ₽',
      image: '/image/excursions/chumbarovka.jpg',
      gallery: [
        '/image/excursions/chumbarovka/1.jpg',
        '/image/excursions/chumbarovka/2.jpg',
        '/image/excursions/chumbarovka/3.jpg',
        '/image/excursions/chumbarovka/4.jpg'
      ]
    },
    {
      id: 2,
      title: 'Гостиные дворы',
      type: 'Музеи',
      count: '12',
      address: 'наб. Северной Двины, 85/86',
      color: '#9682D1',
      description: 'Архангельские Гостиные дворы - уникальный памятник архитектуры XVII века.',
      price: 'от 300 ₽',
      image: '/image/excursions/gostdvor.jpg',
      gallery: [
        '/image/excursions/gostdvor/1.jpg',
        '/image/excursions/gostdvor/2.jpg',
        '/image/excursions/gostdvor/3.jpg',
        '/image/excursions/gostdvor/4.jpg'
      ]
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'Все' || event.category === selectedCategory;
    const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const SearchIcon = FiSearch as IconType;
  const BuildingIcon = FaBuilding as IconType;
  const MapMarkerIcon = FaMapMarkerAlt as IconType;

  return (
      <div className={`home-page ${isLoaded ? 'loaded' : ''} ${isLeaving ? 'leaving' : ''}`}>
        <div className="content">
          <header className="home-header">
            <h1>Главная</h1>
            <div className="profile-section">
              <div className="profile-image" onClick={goToProfile}>
                <img src={profileImage || DEFAULT_AVATAR} alt="Profile" />
              </div>
            </div>
          </header>

          <div className="main-content">
            <div className="search-block">
              <div className="search-header">
                <h2>Поиск лучших мест в городе</h2>
                <button className="theaters-button">
                  {selectedCategory}
                  <span className="arrow" />
                </button>
              </div>
              <div className="search-container">
                {/*@ts-ignore*/}
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <section className="categories-section">
              <h2>Категории</h2>
              <div className="categories-grid">
                {categories.map((category, index) => (
                    <button
                        key={category}
                        className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category)}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {category}
                    </button>
                ))}
              </div>
            </section>

            <section className="events-section">
              <h2>Предстоящие события</h2>
              <div className="events-grid">
                {filteredEvents.map((event, index) => (
                    <div
                        key={event.id}
                        className="event-card"
                        style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <div className="event-image">
                        <img src={event.image} alt={event.title} />
                        <div className="event-category">{event.category}</div>
                      </div>
                      <div className="event-content">
                        <h3>{event.title}</h3>
                        <div className="event-info">
                          {/*@ts-ignore*/}
                          {/*@ts-ignore*/}<div className="info-row"><FaMapMarkerAlt /><span>{event.location}</span></div>
                          {/*@ts-ignore*/}<div className="info-row"><FaCalendar /><span>{event.date}</span></div>
                          {/*@ts-ignore*/}<div className="info-row"><FaClock /><span>{event.time}</span></div>
                        </div>
                        <div className="event-footer">
                          <span className="price">{event.price}</span>
                          <button className="details-button">Подробнее</button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </section>

            <section className="recommendations-section">
              <h2>Наши рекомендации</h2>
              <div className="recommendations-grid">
                {recommendations.map((item, index) => (
                    <div
                        key={item.id}
                        className="recommendation-card"
                        style={{
                          backgroundColor: item.color,
                          animationDelay: `${index * 0.2}s`
                        }}
                        onClick={() => setSelectedExcursion(item)}
                    >
                      {/*@ts-ignore*/}
                      <BuildingIcon className="card-icon" />
                      <div className="card-content">
                        <h3>{item.title}</h3>
                        {/*@ts-ignore*/}
                        <p className="address"><MapMarkerIcon />{item.address}</p>
                        <div className="count">
                          <span>{item.count}</span>
                          <span>{item.type}</span>
                        </div>
                        <button className="details-button">Перейти</button>
                      </div>
                    </div>
                ))}
              </div>
            </section>
          </div>

          {selectedExcursion && (
              <ExcursionModal
                  isOpen
                  onClose={() => setSelectedExcursion(null)}
                  excursion={{
                    id: selectedExcursion.id.toString(),
                    title: selectedExcursion.title,
                    description: selectedExcursion.description || '',
                    address: selectedExcursion.address,
                    price: selectedExcursion.price || '',
                    image: selectedExcursion.image,
                    gallery: selectedExcursion.gallery || []
                  }}
              />
          )}
        </div>
      </div>
  );
};

export default HomePage;