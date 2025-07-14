import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import '../components/scss/ProfilePage.scss';
import PaymentMethods from '../components/PaymentMethods';
import { avatarApi } from "../api/api";
import { logout } from '../api/logout';
import { useSecurity } from "../hooks/useSecurity";

import PasswordSection from "../components/section/PasswordSection";
import PhoneInput from '../components/section/PhoneSection';
import CityAutocomplete, { CityOption } from '../components/section/CitySection';

const Spinner = () => <div style={{ padding: 32, textAlign: 'center' }}>Загрузка…</div>;

type CardDetails = {
    number: string;
    holder: string;
    expiry: string;
    type: 'visa' | 'mastercard';
};

interface Ticket {
    id: number;
    eventName: string;
    date: string;
    time: string;
    location: string;
    price: string;
    status: 'active' | 'used' | 'cancelled';
    qrCode: string;
}

interface PaymentMethod {
    id: string;
    type: 'sbp' | 'card' | 'pay';
    bank?: string;
    icon: string;
    number?: string;
    isMain?: boolean;
}

export interface ProfilePageProps {
    profileImage: string;
    onUpdateImage: (src: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profileImage, onUpdateImage }) => {
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const navigate = useNavigate();
    const { profile, loading, save } = useProfile();
    const { settings: securitySettings, loading: secLoad, toggle, changePassword } = useSecurity();
    const [activeTab, setActiveTab] = useState<'personal' | 'tickets' | 'payment' | 'security'>('personal');
    const [isEditing, setIsEditing] = useState(false);

    const tickets: Ticket[] = [];

    const [form, setForm] = useState({
        full_name: profile?.full_name ?? '',
        email:     profile?.email     ?? '',
        phone:     profile?.phone     ?? '',
        city:      profile?.city      ?? '',
        birthday:  profile?.birthday  ?? '',
    });

    const [cityOption, setCityOption] = useState<CityOption | null>(
        profile?.city ? { value: profile.city, label: profile.city } : null
    );

    useEffect(() => {
        if (!loading && profile) {
            setForm(f => ({
                ...f,
                full_name: profile.full_name ?? '',
                email:     profile.email     ?? '',
                phone:     profile.phone     ?? '',
                city:      profile.city      ?? '',
                birthday:  profile.birthday  ?? '',
            }));
            setCityOption(
                profile.city
                    ? { value: profile.city, label: profile.city }
                    : null
            );
        }
    }, [loading, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCityChange = (opt: CityOption | null) => {
        setCityOption(opt);
        setForm(prev => ({ ...prev, city: opt?.value ?? '' }));
    };

    const handleCancel = () => {
        if (profile) {
            setForm({
                full_name: profile.full_name ?? '',
                email:     profile.email     ?? '',
                phone:     profile.phone     ?? '',
                city:      profile.city      ?? '',
                birthday:  profile.birthday  ?? '',
            });
            setCityOption(profile.city ? { value: profile.city, label: profile.city } : null);
        }
        setIsEditing(false);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const publicUrl = await avatarApi.uploadAvatar(file);
            await save({ avatar: publicUrl });
            onUpdateImage(publicUrl);
            toast.success('Аватар обновлён!');
        } catch {
            toast.error('Не удалось загрузить аватар!');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await save(form);
            toast.success('Данные сохранены!');
            setIsEditing(false);
        } catch {
            toast.error('Убедитесь в том, что все поля заполнены корректно!');
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setButtonsDisabled(true);
        setTimeout(() => setButtonsDisabled(false), 500);
    };

    const [methods, setMethods] = useState<PaymentMethod[]>([
        { id: "1", type: "sbp",  bank: "Яндекс",    icon: "yandex" },
        { id: "2", type: "card", bank: "MIR",       icon: "mir",       number: "5555", isMain: true },
        { id: "3", type: "pay",  bank: "Карта Пэй", icon: "pay" },
    ]);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            localStorage.removeItem('profileImage');
            navigate('/registration');
        }
    };

    if (loading) return <Spinner />;
    if (!profile) return <div className="error-state">Профиль не найден</div>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar">
                    <img src={profile.avatar || './avatars/def.png'} alt="avatar" />
                    <label className="change-avatar-btn">
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }}/>
                        <span className="material-symbols-rounded">photo_camera</span>
                    </label>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Выйти</button>
                <div className="profile-info">
                    <div className="profile-name">
                        <h1>{profile.full_name || 'Укажите свое имя'}</h1>
                        <p>Путешественник</p>
                    </div>
                    <div className="profile-stats">
                        {[
                            { icon: 'museum',        value: '24',   label: 'Музеев посещено' },
                            { icon: 'stars',         value: '4.8',  label: 'Рейтинг' },
                            { icon: 'military_tech', value: 'Эксперт', label: 'Статус' },
                        ].map(s => (
                            <div key={s.label} className="stat-item">
                                <span className="material-symbols-rounded">{s.icon}</span>
                                <div className="stat-content">
                                    <h3>{s.value}</h3>
                                    <p>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    {(['personal','tickets','payment','security'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab===tab?'active':''}`}
                            onClick={() => setActiveTab(tab)}
                        >
              <span className="material-symbols-rounded">
                {tab==='personal' ? 'person'
                    : tab==='tickets'  ? 'local_activity'
                        : tab==='payment'  ? 'credit_card'
                            : 'lock'}
              </span>
                            {tab==='personal' ? 'Личные данные'
                                :tab==='tickets'   ? 'Билеты'
                                    :tab==='payment'   ? 'Способы оплаты'
                                        : 'Безопасность'}
                        </button>
                    ))}
                </div>

                {activeTab==='personal' && (
                    <form className="personal-info" onSubmit={handleSave}>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="material-symbols-rounded">people</span>
                                <div className="info-content">
                                    <label>Имя и фамилия</label>
                                    <input
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-rounded">mail</span>
                                <div className="info-content">
                                    <label>Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-rounded">phone</span>
                                <div className="info-content">
                                    <label>Телефон</label>
                                    <PhoneInput
                                        value={form.phone}
                                        disabled={!isEditing}
                                        onChange={newPhone => setForm(f=>({ ...f, phone: newPhone }))}
                                    />
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-rounded">location_on</span>
                                <div className="info-content">
                                    <label>Город</label>
                                    <CityAutocomplete
                                        value={cityOption}
                                        onChange={handleCityChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="info-item">
                                <span className="material-symbols-rounded">cake</span>
                                <div className="info-content">
                                    <label>Дата рождения</label>
                                    <input
                                        name="birthday"
                                        type="date"
                                        value={form.birthday}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="actions">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    className="edit-btn"
                                    onClick={handleEditClick}
                                >
                                    <span className="material-symbols-rounded">edit</span> Редактировать
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={buttonsDisabled}
                                    >
                                        <span className="material-symbols-rounded">save</span> Сохранить
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleCancel}
                                        disabled={buttonsDisabled}
                                    >
                                        <span className="material-symbols-rounded">close</span> Отмена
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                )}

                {activeTab==='tickets' && (
                    <section className="tickets-info">
                        {tickets.length===0 ? (
                            <div className="no-tickets">
                                <svg className="no-tickets__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
                                    <path fill="none" stroke="#6C5DD3" strokeWidth="4" d="M8 16h48v16H8zm0 32h48v-16H8z" />
                                    <circle cx="16" cy="32" r="4" fill="#6C5DD3" />
                                    <circle cx="48" cy="32" r="4" fill="#6C5DD3" />
                                </svg>
                                <h3 className="no-tickets__title">У вас пока нет билетов</h3>
                                <p className="no-tickets__text">Здесь будут отображаться ваши купленные билеты.</p>
                            </div>
                        ) : (
                            <div className="tickets-list">
                                {tickets.map(t=>(
                                    <article key={t.id} className="ticket-card">
                                        <div className="ticket-card__info">
                                            <h4 className="ticket-card__event">{t.eventName}</h4>
                                            <p className="ticket-card__datetime">{t.date} • {t.time}</p>
                                            <p className="ticket-card__location">{t.location}</p>
                                        </div>
                                        <div className={`ticket-card__status status--${t.status}`}>
                                            {t.status==='active'?'Активен':t.status==='used'?'Использован':'Отменён'}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {activeTab==='payment' && (
                    <section className="payment-info">
                        <PaymentMethods initial={methods} onChange={setMethods} />
                    </section>
                )}

                {activeTab==='security' && (
                    <div className="security-info">
                        <div className="security-settings">
                            <h2>Настройки безопасности</h2>
                            {secLoad ? "Загрузка…" : (
                                <div className="settings-grid">
                                    {securitySettings.map(s => (
                                        <div key={s.key} className="setting-item">
                                            <div className="setting-icon">
                        <span className="material-symbols-rounded">
                          {s.key==='twoFA'?'shield_lock': s.key==='loginAlerts'?'phishing':'devices'}
                        </span>
                                            </div>
                                            <div className="setting-content"><h3>{s.title}</h3></div>
                                            <div className="setting-action">
                                                <label className="switch">
                                                    <input type="checkbox" checked={s.enabled} onChange={()=>toggle(s.key)} />
                                                    <span className="slider" />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <PasswordSection onSave={changePassword} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;