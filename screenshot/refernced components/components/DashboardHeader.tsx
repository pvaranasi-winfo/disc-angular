import type { Environment } from '../types/dashboard.types';

interface DashboardHeaderProps {
    environment: Environment;
    onEnvironmentChange: (env: Environment) => void;
    onRefresh: () => void;
    lastScan: string;
    runId: string;
}

export function DashboardHeader({ environment, onEnvironmentChange, onRefresh, lastScan, runId }: DashboardHeaderProps) {
    const environments: Environment[] = ['DEV', 'UAT', 'PROD'];

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).replace(',', '');
    };

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">WinfoTest Discovery Dashboard</h1>
                <p className="text-sm text-slate-400">
                    Last Scan: {formatDateTime(lastScan)} | Run ID: {runId}
                </p>
            </div>

            <div className="flex items-center gap-3">
                {environments.map((env) => (
                    <button
                        key={env}
                        onClick={() => onEnvironmentChange(env)}
                        className={`env-button ${environment === env ? 'active' : ''}`}
                    >
                        {env === 'PROD' ? 'PROD' : env.charAt(0) + env.slice(1).toUpperCase()}
                    </button>
                ))}

                {/* <button className="env-button flex items-center gap-2">
                    <i className="pi pi-history"></i>
                    History
                </button> */}

                <button className="env-button" onClick={onRefresh}>
                    <i className="pi pi-sync"></i>
                </button>
            </div>
        </div>
    );
}
