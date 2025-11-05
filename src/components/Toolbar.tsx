import React from 'react';

interface Props {
    search: string;
    onChange: (v: string) => void;
    onReset: () => void;

    // חדש: כפתור יצוא
    onExport?: () => void;
    canExport?: boolean;

    // אופציונלי – לא חובה אם כבר יש לך כפתורים חיצוניים
    onSimError?: () => void;
    onRecover?: () => void;
}

export function Toolbar({
    search,
    onChange,
    onReset,
    onExport,
    canExport = true,
    onSimError,
    onRecover,
}: Props) {
    return (
        <div style={{ display: 'flex', gap: 8, padding: '8px 0', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
                type="text"
                placeholder="Search customer/category…"
                value={search}
                onChange={(e) => onChange(e.target.value)}
                style={{ padding: 6, width: 240 }}
            />
            {search && <button onClick={onReset}>Reset</button>}
            {onExport && (
                <button onClick={onExport} disabled={!canExport}>
                    Export CSV
                </button>
            )}
            {onSimError && <button onClick={onSimError}>Sim Error</button>}
            {onRecover && <button onClick={onRecover}>Recover</button>}
        </div>
    );
}
