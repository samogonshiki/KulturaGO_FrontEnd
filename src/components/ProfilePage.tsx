import React, {useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import './scss/ProfilePage.scss';
import PaymentCard, {Card} from './PaymentCard';
import {avatarApi, profileApi} from "../api/api";
import { logout } from '../api/logout';


const Spinner = () => <div style={{ padding: 32, textAlign: 'center' }}>Загрузка…</div>;


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
    const navigate = useNavigate();
    const { profile, loading, error,save } = useProfile()



    const openAddCard  = () => { setCard(null); setModal(true); };
    const openEditCard = () => setModal(true);


    type CardDetails = { number: string; holder: string; expiry: string; type: 'visa' | 'mastercard' };
    const [card,       setCard]   = useState<CardDetails | null>(null);
    const [modalOpen,  setModal]  = useState(false);


    const [form, setForm] = useState({
        full_name: profile?.full_name ?? '',
        email:     profile?.email     ?? '',
        phone:     profile?.phone     ?? '',
        city:      profile?.city      ?? '',
        birthday:  profile?.birthday  ?? '',
    });

    useEffect(() => {
        if (!loading && profile) {
            setForm({
                full_name: profile.full_name ?? '',
                email:     profile.email     ?? '',
                phone:     profile.phone     ?? '',
                city:      profile.city      ?? '',
                birthday:  profile.birthday  ?? '',
            });
        }
    }, [loading, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (profile) setForm({
            full_name: profile.full_name ?? '',
            email:     profile.email     ?? '',
            phone:     profile.phone     ?? '',
            city:      profile.city      ?? '',
            birthday:  profile.birthday  ?? '',
        });
        setIsEditing(false);
    };

    const handleAddCardClick = () => {
        setEditedCard({ number: '', holder: '', expiry: '', type: 'visa' });
        setIsCardEditing(true);
        setIsCardFlipped(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsCardEditing(false);
        setIsCardFlipped(false);
        setIsCardExpanded(false);
    };

    const [activeTab, setActiveTab] = useState<'personal' | 'tickets' | 'payment' | 'security'>('personal');
    const [isEditing, setIsEditing] = useState(false);

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
            toast.error('Убедитесь в том, что все поля заполнены коректно!');
        }
    };

    const tickets: Ticket[] = [];

    const paymentMethods: PaymentMethod[] = [
        { id: '1', type: 'sbp', bank: 'Яндекс',     icon: 'yandex' },
        { id: '2', type: 'card', bank: 'MIR',       icon: 'mir', number: '5555', isMain: true },
        { id: '3', type: 'pay', bank: 'Карта Пэй',  icon: 'pay' },
    ];

    const [isFlipped,   setFlipped]     = useState(false);
    const handleEditCardClick = () => {
        setEditedCard(card!);
        setModal(true); setFlipped(true);
    };

    const saveCard = () => { if (editedCard) setCard(editedCard); closeModal(); };
    const deleteCard = () => { setCard(null); closeModal(); };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCardExpanded, setIsCardExpanded]   = useState(false);
    const [isCardFlipped,  setIsCardFlipped]    = useState(false);
    const [isCardEditing,  setIsCardEditing]    = useState(false);
    const [cardDetails, setCardDetails] = useState<CardDetails>(() => ({
        number: '**** **** **** 1234',
        holder: '',
        expiry: '12/25',
        type:   'visa',
    }));

    useEffect(() => {
        if (!loading && profile && cardDetails.holder === '') {
            setCardDetails(cd => ({ ...cd, holder: profile.full_name || '/avatars/nikita.jpg' }));
        }
    }, [loading, profile]);

    useEffect(() => {
        if (profile) {
            setCardDetails(cd => ({ ...cd, holder: profile.full_name }));
        }
    }, [profile?.full_name]);

    useEffect(() => {
        if (profile?.avatar) onUpdateImage(profile.avatar);
    }, [profile?.avatar]);

    const [editedCard, setEditedCard] = useState<CardDetails>(cardDetails);

    const handleCardClick = () => {
        if (!isCardEditing) {
            setIsCardExpanded(!isCardExpanded);
            setIsCardFlipped(!isCardFlipped);
        }
    };
    const handleCardSave = () => {
        setCardDetails(editedCard);
        setIsCardEditing(false);
        setIsCardFlipped(false);
    };
    const handleCardCancel = () => {
        setEditedCard(cardDetails);
        setIsCardEditing(false);
        setIsCardFlipped(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error(err);
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
                    <img
                        key={profile.avatar}
                        src={profile.avatar || './avatars/def.png'}
                        alt="avatar"
                    />
                    <label className="change-avatar-btn">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <span className="material-symbols-rounded">photo_camera</span>
                    </label>
                </div>

                <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Выйти
                </button>

                <div className="profile-info">
                    <div className="profile-name">
                        <h1>{profile.full_name || 'Укажите свое имя'}</h1>
                        <p>Путешественник</p>
                    </div>

                    <div className="profile-stats">
                        {[
                            { icon: 'museum', value: '24', label: 'Музеев посещено' },
                            { icon: 'stars', value: '4.8', label: 'Рейтинг' },
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
                    <button
                        className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <span className="material-symbols-rounded">person</span>
                        Личные данные
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tickets')}
                    >
                        <span className="material-symbols-rounded">local_activity</span>
                        Билеты
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <span className="material-symbols-rounded">credit_card</span>
                        Способы оплаты
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <span className="material-symbols-rounded">lock</span>
                        Безопасность
                    </button>
                </div>
                <div className="tab-content">
                    {activeTab === 'personal' && (
                        <form className="personal-info" onSubmit={handleSave}>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="material-symbols-rounded">people</span>
                                    <div className="info-content">
                                        <label>Имя и фамилия</label>
                                        <input
                                            type="text"
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
                                            type="email"
                                            name="email"
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
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="material-symbols-rounded">location_on</span>
                                    <div className="info-content">
                                        <label>Город</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={form.city}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="material-symbols-rounded">cake</span>
                                    <div className="info-content">
                                        <label>Дата рождения</label>
                                        <input
                                            type="date"
                                            name="birthday"
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
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <span className="material-symbols-rounded">edit</span>
                                        Редактировать
                                    </button>
                                ) : (
                                    <div className="edit-actions">
                                        <button type="submit" className="save-btn">
                                            <span className="material-symbols-rounded">save</span> Сохранить
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={handleCancel}
                                        >
                                            <span className="material-symbols-rounded">close</span>
                                            Отмена
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {activeTab === 'tickets' && (
                    <section className="tickets-info">
                        {tickets.length === 0 ? 'У вас пока нет билетов' : '…'}
                    </section>
                )}

                {activeTab === 'payment' && (
                    <section className="payment-info">

                        <div className="payment-methods">
                            <div className="payment-methods__list">
                                {paymentMethods.map(pm => (
                                    <div key={pm.id} className="payment-method-item">
                                        <div className={`payment-icon ${pm.icon}`}>
                                          <span className="material-symbols-rounded">
                                            {pm.type === 'card' ? 'credit_card'
                                                : pm.type === 'sbp' ? 'account_balance'
                                                    : 'wallet'}
                                          </span>
                                        </div>

                                        <div className="payment-info">
                                            <div className="payment-label">
                                                {pm.type === 'sbp'  && 'Система быстрых платежей'}
                                                {pm.type === 'card' && 'Банковская карта'}
                                                {pm.type === 'pay'  && 'Электронный кошелёк'}
                                            </div>
                                            <div className="payment-name">
                                                {pm.type === 'sbp'
                                                    ? `СБП • ${pm.bank}`
                                                    : pm.type === 'card'
                                                        ? `${pm.bank} •• ${pm.number}`
                                                        : pm.bank}
                                            </div>
                                        </div>

                                        {pm.isMain && <div className="main-badge">Основная</div>}
                                    </div>
                                ))}

                                <div className="payment-method-item add-new" onClick={openAddCard}>
                                    <div className="payment-icon add">
                                        <span className="material-symbols-rounded">add</span>
                                    </div>
                                    <div className="payment-info"><div className="payment-name">Добавить карту</div></div>
                                </div>
                            </div>
                        </div>

                        {card && (
                            <>
                                <h3>Моя карта</h3>
                                <div className="card-preview" onClick={openEditCard}>
                                    <span>{card.type.toUpperCase()}</span>
                                    <strong>{card.number}</strong>
                                </div>
                            </>
                        )}

                        {modalOpen && (
                            <PaymentCard
                                initial={card ?? { number:'', holder:'', expiry:'', type:'visa' }}
                                onSave={saveCard}
                                onDelete={deleteCard}
                                onClose={closeModal}
                            />
                        )}
                    </section>
                )}

                {activeTab === 'security' && (
                    <section className="security-info">
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;