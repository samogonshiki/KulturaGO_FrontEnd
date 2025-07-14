import React, { useState } from "react";
import PaymentCard from "./PaymentCard";
import "./scss/PaymentMethods.scss";

export type PaymentMethod = {
  id: string;
  type: "sbp" | "card" | "pay";
  bank?: string;
  icon: string;
  number?: string;
  isMain?: boolean;
};
type CardDetails = {
  number: string;
  holder: string;
  expiry: string;
  cvv:   string;
};

interface Props {
  initial: PaymentMethod[];
  onChange: (list: PaymentMethod[]) => void;
}

const PaymentMethods: React.FC<Props> = ({ initial, onChange }) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(initial);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<CardDetails | null>(null);

  const update = (next: PaymentMethod[]) => {
    setMethods(next);
    onChange(next);
  };

  const setMain = (id: string) =>
      update(methods.map(m => ({ ...m, isMain: m.id === id })));

  const remove = (id: string) => update(methods.filter(m => m.id !== id));

  const openAddCard = () => {
    setDraft({ number: "", holder: "", expiry: "", cvv: "" });
    setModalOpen(true);
  };

  const saveCard = (card: CardDetails) => {
    update([
      ...methods,
      {
        id: Date.now().toString(),
        type: "card",
        bank: "MIR",
        icon: "mir",
        number: card.number.slice(-4),
      },
    ]);
    setModalOpen(false);
  };

  return (
      <div className="payment-methods">
        <h2 className="pay-h2" >Способы оплаты</h2>

        <div className="payment-methods__list">
          {methods.map(m => (
              <div key={m.id} className="payment-method-item">
                <div className={`payment-icon ${m.icon}`}>
              <span className="material-symbols-rounded">
                {m.type === "card"
                    ? "credit_card"
                    : m.type === "sbp"
                        ? "account_balance"
                        : "wallet"}
              </span>
                </div>

                <div className="payment-info">
                  <div className="payment-label">
                    {m.type === "sbp"
                        ? "Система быстрых платежей"
                        : m.type === "card"
                            ? "Банковская карта"
                            : "Электронный кошелёк"}
                  </div>
                  <div className="payment-name">
                    {m.type === "sbp"
                        ? `СБП • ${m.bank}`
                        : m.type === "card"
                            ? `${m.bank} •• ${m.number}`
                            : m.bank}
                  </div>
                </div>

                {m.isMain && <div className="main-badge">Основная</div>}

                <div className="actions">
                  {!m.isMain && (
                      <button className = "main-btn pay-btn" title="Сделать основной" onClick={() => setMain(m.id)}>
                        ★
                      </button>
                  )}
                  <button className = "dell-btn pay-btn" title="Удалить" onClick={() => remove(m.id)}>
                    ✕
                  </button>
                </div>
              </div>
          ))}

          <div className="payment-method-item add-new" onClick={openAddCard}>
            <div className="payment-icon add">
              <span className="material-symbols-rounded">add</span>
            </div>
            <div className="payment-info">
              <div className="payment-name">Добавить карту</div>
            </div>
          </div>
        </div>

        {modalOpen && draft && (
            <div className="payment-modal" onClick={() => setModalOpen(false)}>
              <div
                  className="payment-modal__content"
                  onClick={e => e.stopPropagation()}
              >
                <PaymentCard
                    initial={draft}
                    onSave={saveCard}
                    onClose={() => setModalOpen(false)}
                />
              </div>
            </div>
        )}
      </div>
  );
};

export default PaymentMethods;