import React, { useState, useEffect } from 'react';
import './EventsPage.scss';

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  location: string;
  description: string;
  category: 'festival' | 'exhibition' | 'concert' | 'theater' | 'other';
  price: number;
  image: string;
}

const api = {
  async getEvents(): Promise<Event[]> {
    return mockEvents;
  },

  async getEventsByDate(date: Date): Promise<Event[]> {
    return mockEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  },

  async getEventsByCategory(category: string): Promise<Event[]> {
    return category === 'all' 
      ? mockEvents 
      : mockEvents.filter(event => event.category === category);
  }
};

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Фестиваль северной культуры',
    date: (() => {
      const date = new Date('2025-06-12');
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    time: '12:00',
    location: 'Площадь Мира',
    description: 'Ежегодный фестиваль, посвященный культуре и традициям Севера. В программе: выступления фольклорных коллективов, мастер-классы по традиционным ремеслам, дегустация блюд северной кухни.',
    category: 'festival',
    price: 0,
    image: '/image/events/4.jpeg'
  },
  {
    id: '2',
    title: 'Выставка северных художников',
    date: (() => {
      const date = new Date('2025-06-12');
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    time: '10:00',
    location: 'Архангельский музей изобразительных искусств',
    description: 'Выставка современных художников Архангельской области. Представлены работы в различных техниках: живопись, графика, скульптура. Тематика работ связана с природой и бытом Русского Севера.',
    category: 'exhibition',
    price: 300,
    image: './image/events/1.jpg'
  },
  {
    id: '3',
    title: 'Концерт северного хора',
    date: (() => {
      const date = new Date('2025-06-12');
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    time: '19:00',
    location: 'Архангельский театр драмы',
    description: 'Концерт народного северного хора. В программе: традиционные песни Русского Севера, обработки народных мелодий, современные композиции на основе фольклора.',
    category: 'concert',
    price: 500,
    image: '/image/events/5.jpeg'
  },
  {
    id: '4',
    title: 'Иммерсивный спектакль "Поморский ковчег"',
    date: (() => {
      const date = new Date('2025-06-11');
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    time: '18:00',
    location: 'Набережная Северной Двины, 1',
    description: 'Помор-Тур и Архангельский театр драмы им. М.В. Ломоносова представляют: Иммерсивный спектакль',
    category: 'theater',
    price: 800,
    image: '/image/events/2.jpg'
  },
  {
    id: '5',
    title: 'МЕДВЕДЬ',
    date: (() => {
      const date = new Date('2025-06-11');
      date.setHours(0, 0, 0, 0);
      return date;
    })(),
    time: '15:00',
    location: 'Культурный центр "Поморье"',
    description: 'Мастер-класс по росписи архангельских пряников. Участники узнают секреты традиционных узоров и смогут создать свой уникальный пряник.',
    category: 'theater',
    price: 400,
    image: '/image/events/3.jpg'
  }
];

const EventsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Все события', icon: 'event' },
    { id: 'festival', label: 'Фестивали', icon: 'celebration' },
    { id: 'exhibition', label: 'Выставки', icon: 'museum' },
    { id: 'concert', label: 'Концерты', icon: 'music_note' },
    { id: 'theater', label: 'Театр', icon: 'theater_comedy' },
    { id: 'other', label: 'Другое', icon: 'more_horiz' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedEvents = await api.getEvents();
      console.log('Initial events:', fetchedEvents);
      console.log('Selected date:', selectedDate);
      
      if (selectedDate) {
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        fetchedEvents = fetchedEvents.filter(event => {
          const eventDateStr = event.date.toISOString().split('T')[0];
          const match = eventDateStr === selectedDateStr;
          console.log(`Comparing event date ${eventDateStr} with selected date ${selectedDateStr}: ${match}`);
          return match;
        });
        console.log('Events after date filtering:', fetchedEvents);
      }
      
      if (selectedCategory !== 'all') {
        fetchedEvents = fetchedEvents.filter(event => event.category === selectedCategory);
        console.log('Events after category filtering:', fetchedEvents);
      }
      
      if (searchQuery) {
        fetchedEvents = fetchedEvents.filter(event =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log('Events after search filtering:', fetchedEvents);
      }
      
      setEvents(fetchedEvents);
    } catch (err) {
      setError('Произошла ошибка при загрузке событий');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() || 7;

    const days = [];
    for (let i = 1; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
  };

  const hasEventsOnDate = (date: Date) => {
    return mockEvents.some(event => isSameDay(event.date, date));
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const days = getDaysInMonth(selectedDate);

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>События в Архангельске</h1>
        <div className="search-bar">
          <span className="material-symbols-rounded">search</span>
          <input
            type="text"
            placeholder="Поиск событий..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              fetchEvents();
            }}
          />
        </div>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="material-symbols-rounded">{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="events-content">
        <div className="events-calendar">
          <div className="calendar-header">
            <button className="nav-btn" onClick={() => navigateMonth('prev')}>
              <span className="material-symbols-rounded">chevron_left</span>
            </button>
            <h2>{selectedDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}</h2>
            <button className="nav-btn" onClick={() => navigateMonth('next')}>
              <span className="material-symbols-rounded">chevron_right</span>
            </button>
          </div>
          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day ? 'has-date' : ''} ${
                  day && isSameDay(day, selectedDate) ? 'selected' : ''
                } ${day && hasEventsOnDate(day) ? 'has-events' : ''}`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day?.getDate()}
                {day && hasEventsOnDate(day) && (
                  <div className="event-dot"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="events-list">
          {loading ? (
            <div className="loading">
              <span className="material-symbols-rounded loading-icon">sync</span>
              <p>Загрузка событий...</p>
            </div>
          ) : error ? (
            <div className="error">
              <span className="material-symbols-rounded">error</span>
              <p>{error}</p>
            </div>
          ) : events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                  <div className="event-category">
                    <span className="material-symbols-rounded">
                      {categories.find(c => c.id === event.category)?.icon}
                    </span>
                  </div>
                </div>
                <div className="event-info">
                  <div className="event-date">
                    <span className="material-symbols-rounded">calendar_today</span>
                    <span>{event.date.toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="event-time">
                    <span className="material-symbols-rounded">schedule</span>
                    <span>{event.time}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <div className="event-location">
                    <span className="material-symbols-rounded">location_on</span>
                    <span>{event.location}</span>
                  </div>
                  <p>{event.description}</p>
                  <div className="event-footer">
                    <div className="event-price">
                      {event.price === 0 ? 'Бесплатно' : `${event.price} ₽`}
                    </div>
                    <button className="buy-ticket-btn">
                      <span>Купить билет</span>
                      <span className="material-symbols-rounded">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <span className="material-symbols-rounded">event_busy</span>
              <p>Событий не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage; 