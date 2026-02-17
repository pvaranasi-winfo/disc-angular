export type Environment = 'DEV' | 'UAT' | 'PROD';

export type ComponentType = 'Database' | 'Application' | 'Service';

export type ComponentStatus = 'Active' | 'Upgrade Available' | 'Inactive';

export type TicketPriority = 'High' | 'Medium' | 'Low' | 'Critical';

export interface SubComponent {
    name: string;
    version: string;
}

export interface Component {
    name: string;
    type: ComponentType;
    currentVersion: string;
    status: ComponentStatus;
    subComponents?: SubComponent[];
}

export interface JiraTicket {
    id: string;
    title: string;
    priority: TicketPriority;
    description: string;
}

export interface GithubIssue {
    id: string;
    summary: string;
    description: string;
    tag: string;
}

export interface Documentation {
    title: string;
    url: string;
    description: string;
    folderName: string;
}

export interface SummaryMetrics {
    healthScore: number;
    criticalCount: number;
    upgradeCount: number;
}

export interface Insights {
    jiraTickets: JiraTicket[];
    github: GithubIssue[];
    docs: Documentation[];
}

export interface DashboardResponse {
    id: string;
    environment: string;
    scanTimestamp: string;
    runId: string;
    summaryMetrics: SummaryMetrics;
    components: Component[];
    insights: Insights;
}
