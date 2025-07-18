import React, { useState, useMemo, FC, SVGProps } from 'react';
import { useNavigate } from 'react-router-dom';
import '../scss/AuthModal.scss';
import { authApi } from '../../api/api';

import {
  FaCheckCircle as RawFaCheckCircle,
  FaTimesCircle as RawFaTimesCircle,
} from 'react-icons/fa';

const FaCheckCircle = RawFaCheckCircle as FC<SVGProps<SVGSVGElement>>;
const FaTimesCircle = RawFaTimesCircle as FC<SVGProps<SVGSVGElement>>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Rule {
  label: string;
  test: (pwd: string) => boolean;
}

const passwordRules: Rule[] = [
  { label: 'Не менее 12 символов',              test: pwd => pwd.length >= 12 },
  { label: 'Хотя бы одна цифра',                 test: pwd => /\d/.test(pwd) },
  { label: 'Хотя бы одна заглавная буква',       test: pwd => /[A-Z]/.test(pwd) },
  { label: 'Хотя бы одна строчная буква',        test: pwd => /[a-z]/.test(pwd) },
  { label: 'Хотя бы один спецсимвол (!@#$%^&*)', test: pwd => /[!@#$%^&*]/.test(pwd) },
];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [isLogin, setIsLogin]                 = useState(true);
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [name, setName]                       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const ruleResults = useMemo(
      () => passwordRules.map(r => ({ label: r.label, ok: r.test(password) })),
      [password]
  );
  const allOk = ruleResults.every(r => r.ok);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      if (!allOk) {
        alert('Пароль не соответствует всем требованиям');
        return;
      }
    }

    try {
      if (isLogin) {
        await authApi.signin(email, password);
      } else {
        await authApi.signup(email, name, password);
        await authApi.signin(email, password);
      }

      onClose();
      navigate('/welcome');
    } catch (err: any) {
      const msg =
          err.response?.data?.message ||
          err.response?.data ||
          'Ошибка авторизации';
      alert(msg);
    }
  };

  return (
      <div className="auth-modal">
        <div className="auth-modal__overlay" onClick={onClose} />
        <div className="auth-modal__content">
          <div className="auth-modal__close-wrapper">
            <button className="auth-modal__close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="auth-modal__header">
            <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
            <p>
              {isLogin
                  ? 'Войдите в свой аккаунт, чтобы продолжить'
                  : 'Создайте аккаунт, чтобы начать путешествие'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-modal__form">
            {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Имя</label>
                  <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Введите ваше имя"
                      required
                  />
                </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Введите ваш email"
                  required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
              />
              {!isLogin && (
                  <ul className="password-rules">
                    {ruleResults.map((r, i) => (
                        <li key={i} className={r.ok ? 'ok' : 'fail'}>
                          {r.ok ? <FaCheckCircle className="icon" /> : <FaTimesCircle className="icon" />}
                          <span>{r.label}</span>
                        </li>
                    ))}
                  </ul>
              )}
            </div>

            {!isLogin && (
                <div className="form-group">
                  <label htmlFor="confirmPassword">Подтвердите пароль</label>
                  <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Повторите пароль"
                      required
                  />
                </div>
            )}

            <button
                type="submit"
                className="submit-button"
                disabled={!isLogin && !allOk}
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="auth-modal__footer">
            <p>
              {isLogin ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                  className="switch-button"
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </p>
          </div>
        </div>
      </div>
  );
};

export default AuthModal;