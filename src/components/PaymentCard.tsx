import React, { useState, ChangeEvent, FormEvent, useMemo } from "react";
import { toast } from "react-toastify";
import "./scss/PaymentCard.scss";

type CardData = {
  number: string;
  holder: string;
  expiry: string;
  cvv:    string;
};

interface Props {
  initial?: CardData;
  onSave:  (card: CardData) => void;
  onClose: () => void;
}

function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, "").split("").reverse().map(n => +n);
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) {
      const dbl = d * 2;
      return acc + (dbl > 9 ? dbl - 9 : dbl);
    }
    return acc + d;
  }, 0);
  return sum % 10 === 0 && digits.length >= 13;
}

function expiryCheck(exp: string): boolean {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) return false;
  const [m, y] = exp.split("/").map(n => parseInt(n, 10));
  const now = new Date();
  const expDate = new Date(2000 + y, m - 1, 1);
  return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
}

function detectBrand(num: string): { name: string; icon: string; color: string } {
  const n = num.replace(/\D+/g, "");
  if (/^4/.test(n))       return { name: "VISA",       icon: "visa",       color: "#1A1B25" };
  if (/^5[1-5]/.test(n))   return { name: "MASTERCARD", icon: "mastercard", color: "#EB001B" };
  if (/^220[0-4]/.test(n)) return { name: "MIR",         icon: "mir",        color: "#6C5DD3" };
  return { name: "КАРТА",       icon: "generic",    color: "#6C5DD3" };
}

const formatNumber = (raw: string) =>
    raw.replace(/\D+/g, "").slice(0,16).replace(/(.{4})/g,"$1 ").trim();

const translit: Record<string,string> = {
  а:"A",б:"B",в:"V",г:"G",д:"D",е:"E",ё:"E",ж:"ZH",з:"Z",и:"I",й:"Y",
  к:"K",л:"L",м:"M",н:"N",о:"O",п:"P",р:"R",с:"S",т:"T",у:"U",ф:"F",
  х:"KH",ц:"TS",ч:"CH",ш:"SH",щ:"SCH",ъ:"",ы:"Y",ь:"",э:"E",ю:"YU",я:"YA",
};

const PaymentCard: React.FC<Props> = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState<CardData>({
    number: initial?.number ?? "",
    holder: initial?.holder ?? "",
    expiry: initial?.expiry ?? "",
    cvv:    initial?.cvv    ?? ""
  });
  const [attempted, setAttempted] = useState(false);
  const isNumberValid = luhnCheck(form.number);
  const isExpiryValid = expiryCheck(form.expiry);
  const brand = useMemo(() => detectBrand(form.number), [form.number]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "number") {
      setForm(p => ({ ...p, number: formatNumber(value) }));
    } else if (name === "holder") {
      const out = value.split("")
          .map(ch => translit[ch.toLowerCase()] ?? ch)
          .join("")
          .toUpperCase();
      setForm(p => ({ ...p, holder: out }));
    } else if (name === "expiry") {
      const v = value.replace(/\D/g,"").slice(0,4);
      setForm(p => ({ ...p, expiry: v.length>2 ? v.slice(0,2)+"/"+v.slice(2) : v }));
    } else if (name === "cvv") {
      setForm(p => ({ ...p, cvv: value.replace(/\D/g,"").slice(0,4) }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isNumberValid) {
      toast.error("Неверный номер карты");
      return;
    }
    if (!isExpiryValid) {
      toast.error("Неверный срок действия карты");
      return;
    }
    if (form.cvv.length < 3) {
      toast.error("Введите CVV");
      return;
    }
    onSave(form);
  };

  return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-pay" onClick={e => e.stopPropagation()}>
          <span className="close-btn" onClick={onClose}>×</span>

          <div
              className="card card-front"
              style={{ background: `linear-gradient(135deg, ${brand.color}CC, rgba(108,93,211,0.9))`, width: "100%", height: "200px" }}
          >
            <div className={`card-brand-icon ${brand.icon}`} />
            <span className="card-label">{brand.name}</span>

            <div className="card-number-row">
              <span className="masked">{form.number || "#### #### #### ####"}</span>
              <div className="cvv-box">{form.cvv || "CVV"}</div>
            </div>

            <div className="card-holder-row">
              <span className="holder-label">Владелец</span>
              <span className="holder-value">{form.holder || "FULL NAME"}</span>
            </div>

            <div className="card-expiry-row">
              <span className="expiry-label">ММ/ГГ</span>
              <span className="expiry-value">{form.expiry || "MM/YY"}</span>
            </div>
          </div>

          <form className="card card-back" onSubmit={handleSubmit}>
            <div className="form-field">
              <input
                  name="number"
                  value={form.number}
                  onChange={handleChange}
                  placeholder=" "
                  className={attempted && !isNumberValid ? "invalid" : ""}
              />
              <label>Номер Карты</label>
            </div>

            <div className="two-cols">
              <div className="form-field">
                <input
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder=" "
                    className={attempted && !isExpiryValid ? "invalid" : ""}
                />
                <label>ММ/ГГ</label>
              </div>
              <div className="form-field">
                <input
                    name="cvv"
                    value={form.cvv}
                    onChange={handleChange}
                    placeholder=" "
                />
                <label>CVV</label>
              </div>
            </div>

            <div className="form-field">
              <input
                  name="holder"
                  value={form.holder}
                  onChange={handleChange}
                  placeholder=" "
              />
              <label>Владелец</label>
            </div>

            <button className="save-btn" type="submit">Сохранить</button>
          </form>
        </div>
      </div>
  );
};

export default PaymentCard;