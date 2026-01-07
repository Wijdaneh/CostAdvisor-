import React from 'react';
import Chat from './Chat';

const Dashboard = ({ data, onReset }) => {
    const { summary, preview } = data;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
    };

    const isPositiveVarianceBad = summary.total_variance > 0; // Cost > Budget

    return (
        <div className="container animate-fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Tableau de Bord</h2>
                <button onClick={onReset} className="btn btn-secondary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    Importer un autre fichier
                </button>
            </header>

            {/* Global KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Budget Total</p>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(summary.total_budget)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Dépenses Réelles</p>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formatCurrency(summary.total_real)}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: isPositiveVarianceBad ? '4px solid #ef4444' : '4px solid #10b981', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Écart Global</p>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isPositiveVarianceBad ? '#ef4444' : '#10b981' }}>
                        {summary.total_variance > 0 ? '+' : ''}{formatCurrency(summary.total_variance)}
                    </div>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                        {isPositiveVarianceBad ? '⚠️ Dépassement de budget' : '✅ Économie réalisée'}
                    </p>
                </div>
                {summary.top_offender && (
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-muted" style={{ fontSize: '0.9rem', color: '#fca5a5' }}>Zone de vigilance</p>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{summary.top_offender.service}</div>
                        <div style={{ color: '#fca5a5' }}>
                            +{formatCurrency(summary.top_offender.amount)} d'écart
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', minHeight: '600px' }}>
                {/* Left: Data Table / Details */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <h3>Aperçu des données</h3>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {preview && (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px' }}>Service</th>
                                        <th style={{ padding: '10px' }}>Budget</th>
                                        <th style={{ padding: '10px' }}>Réel</th>
                                        <th style={{ padding: '10px' }}>Écart</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px' }}>{row.service}</td>
                                            <td style={{ padding: '10px' }}>{formatCurrency(row.budget)}</td>
                                            <td style={{ padding: '10px' }}>{formatCurrency(row.real)}</td>
                                            <td style={{ padding: '10px', color: row.variance > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                                                {row.variance > 0 ? '+' : ''}{formatCurrency(row.variance)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            * Seuls les 5 premiers éléments sont affichés dans cet aperçu.
                        </div>
                    </div>
                </div>

                {/* Right: Chat */}
                <div style={{ height: '100%' }}>
                    <Chat />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
