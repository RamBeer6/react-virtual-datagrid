import React from 'react';

interface Props {
    search: string;
    onChange: (v: string) => void;
    onReset: () => void;
}

export function Toolbar({ search, onChange, onReset }: Props) {
    return (
        <div style={{
            display: 'flex',
            gap: 8,
            padding: '8px 0',
            alignItems: 'center'
        }}>
            <input
                type="text"
                placeholder="Search customer/category…"
                value={search}
                onChange={(e) => onChange(e.target.value)}
                style={{ padding: 6, width: 220 }}
            />
            {search && <button onClick={onReset}>Reset</button>}
        </div>
    );
}
