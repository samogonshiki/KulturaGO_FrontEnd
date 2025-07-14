import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
    onSave: (oldPwd: string, newPwd: string) => Promise<void>;
}

const PasswordSection: React.FC<Props> = ({ onSave }) => {
    const [oldPwd, setOld] = useState("");
    const [newPwd, setNew] = useState("");
    const [repPwd, setRep] = useState("");

    const handle = async () => {
        if (newPwd !== repPwd || newPwd.length < 6) {
            toast.error("Пароли не совпадают");
            return;
        }
        try {
            await onSave(oldPwd, newPwd);
            toast.success("Пароль изменён");
            setOld("");
            setNew("");
            setRep("");
        } catch {
            toast.error("Не удалось сменить пароль");
        }
    };

    return (
        <div className="password-section">
            <h2>Изменение пароля</h2>

            <div className="password-form">
                <div className="form-group">
                    <label>Текущий пароль</label>
                    <input
                        type="password"
                        value={oldPwd}
                        onChange={(e) => setOld(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Новый пароль</label>
                    <input
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNew(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Подтверждение пароля</label>
                    <input
                        type="password"
                        value={repPwd}
                        onChange={(e) => setRep(e.target.value)}
                    />
                </div>

                <button type="button" className="change-password-btn" onClick={handle}>
                    <span className="material-symbols-rounded">lock_reset</span>
                    Изменить пароль
                </button>
            </div>
        </div>
    );
};

export default PasswordSection;