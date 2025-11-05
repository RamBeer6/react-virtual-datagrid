// יצירת CSV בטוח (כולל escape לתווים מיוחדים) והורדה כדפדפן
export function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const esc = (val: unknown) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        // אם יש פסיקים/גרשיים/שבירת שורה – עוטפים במרכאות וכופלים גרשיים
        if (/[",\n]/.test(s)) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    const lines = [
        headers.join(','),                         // כותרות
        ...rows.map(r => headers.map(h => esc(r[h])).join(',')), // שורות
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
