export interface AgentLog {
  msg: string;
  type: 'system' | 'success' | 'warning';
  delay: number;
}

export interface AgentProgress {
  percentage: number;
  status: string;
}
