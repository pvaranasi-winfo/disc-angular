export interface AnalysisResponse {
  comparison: ComparisonItem[];
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  sharepoint: SharePointData | null;
  stats: DatabaseStats;
  strategy: Strategy;
  compatibility?: CompatibilityData[];
}

export interface ComparisonItem {
  component: string;
  current: string;
  recommended: string;
  why: string;
}

export interface Recommendation {
  description: string;
  feature: string;
  impacted_objects: string[];
}

export interface RoadmapItem {
  application: string;
  current: string;
  guideline: string;
  observation: string;
  target: string;
}

export interface SharePointData {
  file_category_distribution: Record<string, number>;
  file_samples: FileSample[];
  site_type_distribution: Record<string, number>;
  storage_used_bytes: number;
  total_files: number;
  total_sites: number;
}

export interface FileSample {
  name: string;
  site: string;
  size: number;
}

export interface DatabaseStats {
  id: string;
  invalid_objects: InvalidObject[];
  database_information: DatabaseInformation;
  parameters: DatabaseParameters;
  stats_type: string;
}

export interface InvalidObject {
  owner: string;
  object_type: string;
  invalid_count: number;
}

export interface DatabaseInformation {
  db_name: string;
  db_version: string;
  server_name: string;
  os: string;
  flashback_status: string;
  dataguard_role: string;
  instance_type: string;
  data_size_gb: number;
}

export interface DatabaseParameters {
  sga_target: {
    name: string;
    value: string;
  };
  audit_trail: {
    name: string;
    value: string;
  };
  hidden_parameters: Array<{
    name: string;
    value: string;
  }>;
}

export interface Strategy {
  how: string;
  when: string;
}

export interface CompatibilityData {
  id: string;
  base_component: string;
  base_target_version: string;
  matrix: CompatibilityMatrixItem[];
  impact_analysis: ImpactAnalysis[];
  detailed_reasoning: DetailedReasoning[];
}

export interface CompatibilityMatrixItem {
  component: string;
  current_version: string | null;
  'proposed_target(from developers)': string | null;
  'proposed_target(from agent)': string;
  certified_stack_1_lts: string;
  certified_stack_2_modern: string;
  is_compatible: boolean;
  status_message: string;
  action_required: string | null;
}

export interface ImpactAnalysis {
  component: string;
  risk_level: string;
  description: string;
}

export interface DetailedReasoning {
  component_name: string;
  transition_stack: string;
  rationale: string;
  deprecated_objects: string[];
}
