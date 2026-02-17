import { useState, useEffect } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { SummaryCards } from '../components/SummaryCards';
import { ComponentCard } from '../components/ComponentCard';
import { JiraTickets } from '../components/JiraTickets';
import { GithubIssues } from '../components/GithubIssues';
import { DocumentationLinks } from '../components/DocumentationLinks';
import { dashboardApi } from '../services/dashboardApi';
import type { DashboardResponse, Environment } from '../types/dashboard.types';

export function Dashboard() {
    const [environment, setEnvironment] = useState<Environment>('DEV');
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [environment]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // const data = await fetchDashboardDataFromApi(environment);
            const data = await dashboardApi.fetchDashboardData(environment);
            setDashboardData(data);
        } catch (err : any) {
            setError(err.message || 'Unknown error');
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleEnvironmentChange = (env: Environment) => {
        setEnvironment(env);
    };

    if (loading) {
        return (
            <div className="dashboard-container min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="pi pi-spin pi-spinner text-4xl text-cyan-400 mb-4"></i>
                    <p className="text-slate-400">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <i className="pi pi-exclamation-circle text-4xl text-red-500 mb-4"></i>
                    <p className="text-white text-lg mb-2">Error loading dashboard</p>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="env-button active"
                    >
                        <i className="pi pi-refresh mr-2"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    return (
        <div className="dashboard-container min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader
                    environment={environment}
                    onEnvironmentChange={handleEnvironmentChange}
                    onRefresh={fetchDashboardData}
                    lastScan={dashboardData.scanTimestamp}
                    runId={dashboardData.runId}
                />

                <SummaryCards
                    summary={dashboardData.summaryMetrics}
                    componentCount={dashboardData.components.length}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold text-white mb-4">Detected Components</h2>
                        {dashboardData.components.map((component, index) => (
                            <ComponentCard key={index} component={component} />
                        ))}
                    </div>

                    <div>
                        <JiraTickets tickets={dashboardData.insights.jiraTickets} />
                        <GithubIssues issues={dashboardData.insights.github} />
                        <DocumentationLinks documentation={dashboardData.insights.docs} />
                    </div>
                </div>
            </div>
        </div>
    );
}
