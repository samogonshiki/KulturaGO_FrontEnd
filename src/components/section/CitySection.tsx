import React, { useMemo } from 'react'
import Select, { components, StylesConfig } from 'react-select'

export interface CityOption {
    label: string
    value: string
}

interface Props {
    value: CityOption | null
    onChange: (opt: CityOption | null) => void
    disabled?: boolean
}

const ALL_CITIES: CityOption[] = [
    { value: 'Москва',            label: 'Москва' },
    { value: 'Санкт-Петербург',   label: 'Санкт-Петербург' },
    { value: 'Новосибирск',        label: 'Новосибирск' },
    { value: 'Екатеринбург',       label: 'Екатеринбург' },
    { value: 'Казань',             label: 'Казань' },
    { value: 'Архангельск',             label: 'Архангельск' },
]

const SHORTCUTS: Record<string,string> = {
    'мск': 'Москва',
    'спб': 'Санкт-Петербург',
    'питер': 'Санкт-Петербург',
    'арх': 'Архангельск',
}

const customStyles: StylesConfig<CityOption, false> = {
    control: (base) => ({
        ...base,
        background: 'transparent',
        borderColor: '#6C5DD3',
        '&:hover': { borderColor: '#A594FF' },
        boxShadow: 'none',
    }),
    menu: (base) => ({
        ...base,
        background: '#1A1B25',
        color: '#fff',
    }),
    option: (base, state) => ({
        ...base,
        background: state.isFocused ? 'rgba(108,93,211,0.3)' : 'transparent',
        color: '#fff',
        cursor: 'pointer',
    }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    placeholder: (base) => ({ ...base, color: 'rgba(255,255,255,0.5)' }),
}

const CityAutocomplete: React.FC<Props> = ({ value, onChange, disabled }) => {
    const filterOptions = useMemo<CityOption[]>(() => {
        if (!value) return ALL_CITIES
        const input = value.label.toLowerCase().trim()

        if (SHORTCUTS[input]) {
            const full = SHORTCUTS[input]
            return ALL_CITIES.filter(c => c.value === full)
        }

        return ALL_CITIES.filter(c =>
            c.value.toLowerCase().includes(input)
        )
    }, [value])

    return (
        <Select<CityOption>
            isClearable
            isDisabled={disabled}
            placeholder="Выберите город…"
            styles={customStyles}
            options={filterOptions}
            value={value}
            onChange={opt => onChange(opt as CityOption)}
            components={{
                DropdownIndicator: () => <span className="material-symbols-rounded">expand_more</span>,
                IndicatorSeparator: () => null
            }}
            noOptionsMessage={() => 'Ничего не найдено'}
        />
    )
}

export default CityAutocomplete