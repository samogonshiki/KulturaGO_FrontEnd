import React from 'react';
import './InDevelopmentPage.scss';

const InDevelopmentPage: React.FC = () => {
  return (
    <div className="in-development-page">
      <div className="content">
        <div className="construction-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Функция в разработке</h1>
        <p>Мы усердно работаем над созданием этой функции, чтобы сделать ваше путешествие еще более увлекательным.</p>
        <div className="signature">
          <p>С уважением,</p>
          <p className="team-name">Команда разработчиков KulturaGo</p>
        </div>
      </div>
    </div>
  );
};

export default InDevelopmentPage; 