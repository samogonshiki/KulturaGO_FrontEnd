import React from 'react';
import InputMask, { Props as InputMaskProps } from 'react-input-mask';

interface PhoneInputProps {
    value: string;
    onChange: (newValue: string) => void;
    disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, disabled }) => {
    const handleBeforeMaskedStateChange: NonNullable<InputMaskProps['beforeMaskedStateChange']> =
        ({ previousState, nextState }) => {
            let { value: v } = nextState;

            if (!previousState.value && v.startsWith('8')) {
                v = '+7 ' + v.slice(1);
            }

            return { ...nextState, value: v };
        };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <InputMask
            mask="+7 (999) 999-99-99"
            maskChar=" "
            value={value}
            disabled={disabled}
            onChange={handleChange}
            beforeMaskedStateChange={handleBeforeMaskedStateChange}
        >
            {(inputProps) => <input {...inputProps} type="tel" />}
        </InputMask>
    );
};

export default PhoneInput;