import type { GithubIssue } from '../types/dashboard.types';

interface GithubIssuesProps {
    issues: GithubIssue[];
}

export function GithubIssues({ issues }: GithubIssuesProps) {
    if (issues.length === 0) {
        return null;
    }

    const getTagColor = (tag: string) => {
        switch (tag.toLowerCase()) {
            case 'infra':
                return 'bg-purple-500/20 text-purple-400';
            case 'bug':
                return 'bg-red-500/20 text-red-400';
            case 'feature':
                return 'bg-blue-500/20 text-blue-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="mb-3 border border-slate-700 rounded-lg bg-[#1e293b]">
            <div className="flex items-center gap-1 mb-4 bg-[#0f172a] w-full p-3">
                <i className="pi pi-github text-slate-400"></i>
                <h2 className="text-lg font-semibold text-white">GitHub Issues</h2>
            </div>

            <div className="p-3">
                {issues.map((issue) => (
                    <div key={issue.id} className="dashboard-card p-3 mb-3 last:mb-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-semibold">#{issue.id}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTagColor(issue.tag)}`}>
                                        {issue.tag}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-slate-300 mb-1">{issue.summary}</p>
                                <p className="text-xs text-slate-400">{issue.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
