export interface AnalysisResponse {
  comparison: ComparisonItem[];
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  sharepoint: SharePointData | null;
  stats: SchemaStats;
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

export interface SchemaStats {
  avg_cols_per_table: number;
  constraint_count: number;
  data_type_distribution: Record<string, number>;
  deprecated_types: Record<string, number>;
  index_count: number;
  table_count: number;
  total_columns: number;
  unique_data_types: string[];
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
