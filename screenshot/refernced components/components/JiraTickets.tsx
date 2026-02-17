import type { JiraTicket } from '../types/dashboard.types';

interface JiraTicketsProps {
    tickets: JiraTicket[];
}

export function JiraTickets({ tickets }: JiraTicketsProps) {
    if (tickets.length === 0) {
        return null;
    }

    const getPriorityClass = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            default:
                return 'priority-low';
        }
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
            case 'critical':
                return 'badge-high';
            case 'medium':
                return 'badge-medium';
            default:
                return 'badge-medium';
        }
    };

    return (
        <div className="mb-3 border border-slate-700 rounded-lg bg-[#1e293b]">
            <div className="flex items-center gap-1 mb-4 bg-[#0f172a] w-full p-3">
                <i className="pi pi-exclamation-triangle text-slate-400"></i>
                <h2 className="text-lg font-semibold text-white">Related Jira Tickets</h2>
            </div>

            <div className="p-3">
                {tickets.map((ticket) => (
                    <div key={ticket.id} className={`jira-ticket ${getPriorityClass(ticket.priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-semibold">{ticket.id}</span>
                                    <span className={getPriorityBadgeClass(ticket.priority)}>
                                        {ticket.priority}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-300 mb-1">{ticket.title}</p>
                                <p className="text-xs text-slate-400">{ticket.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
