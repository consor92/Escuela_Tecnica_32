'use client';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });

const customStyles = {
  control: (base: any) => ({
    ...base,
    background: 'var(--mantine-color-body)',
    borderColor: 'var(--mantine-color-default-border)',
    borderRadius: 'var(--mantine-radius-md)',
    color: 'var(--mantine-color-text)',
    minHeight: '34px',
    fontSize: '0.8125rem',
    boxShadow: 'none',
    '&:hover': { borderColor: 'var(--mantine-color-default-border)' },
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--mantine-color-body)',
    border: '1px solid var(--mantine-color-default-border)',
    borderRadius: 'var(--mantine-radius-md)',
    zIndex: 9999,
    boxShadow: 'var(--mantine-shadow-md)',
  }),
  menuList: (base: any) => ({
    ...base,
    padding: 4,
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'var(--mantine-primary-color-light)' : 'transparent',
    color: state.isFocused ? 'var(--mantine-primary-color-light-color)' : 'var(--mantine-color-text)',
    borderRadius: 'var(--mantine-radius-sm)',
    fontSize: '0.8125rem',
    padding: '8px 12px',
    cursor: 'pointer',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--mantine-color-text)',
    fontSize: '0.8125rem',
  }),
  input: (base: any) => ({
    ...base,
    color: 'var(--mantine-color-text)',
    fontSize: '0.8125rem',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--mantine-color-placeholder)',
    fontSize: '0.8125rem',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: 'var(--mantine-color-dimmed)',
  }),
  clearIndicator: (base: any) => ({
    ...base,
    color: 'var(--mantine-color-dimmed)',
  }),
};

interface Option {
  value: any;
  label: string;
}

export default function SearchableSelect({
  options, value, onChange, placeholder, width, isClearable,
}: {
  options: Option[];
  value: any;
  onChange: (v: any) => void;
  placeholder?: string;
  width?: string;
  isClearable?: boolean;
}) {
  const selected = options.find(o => o.value === value) || null;
  return (
    <div style={{ minWidth: width || '250px' }}>
      <Select
        options={options}
        value={selected}
        onChange={(o: any) => onChange(o ? o.value : null)}
        placeholder={placeholder || 'Buscar...'}
        styles={customStyles}
        isClearable={isClearable}
        noOptionsMessage={() => 'Sin resultados'}
      />
    </div>
  );
}
