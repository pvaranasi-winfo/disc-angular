import type { SummaryMetrics } from '../types/dashboard.types';

interface SummaryCardsProps {
    summary: SummaryMetrics;
    componentCount: number;
}

export function SummaryCards({ summary, componentCount }: SummaryCardsProps) {
    const cards = [
        {
            icon: 'pi pi-check-circle',
            iconClass: 'icon-success',
            value: `${summary.healthScore}%`,
            label: 'System Health',
            bgClass: 'bg-slate-800'
        },
        {
            icon: 'pi pi-exclamation-circle',
            iconClass: 'icon-warning',
            value: summary.upgradeCount.toString(),
            label: 'Pending Upgrades',
            bgClass: 'bg-slate-800'
        },
        {
            icon: 'pi pi-exclamation-triangle',
            iconClass: 'icon-error',
            value: summary.criticalCount.toString(),
            label: 'Critical Issues',
            bgClass: 'bg-slate-800'
        },
        {
            icon: 'pi pi-box',
            iconClass: 'icon-info',
            value: componentCount.toString(),
            label: 'Components',
            bgClass: 'bg-slate-800'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((card, index) => (
                <div key={index} className="metric-card">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <i className={`${card.icon} ${card.iconClass} text-2xl`}></i>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">{card.value}</div>
                                <div className="text-sm text-slate-400">{card.label}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
