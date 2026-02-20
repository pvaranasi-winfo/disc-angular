export interface AnalysisResponse {
  comparison: ComparisonItem[];
  recommendations: Recommendation[];
  roadmap: RoadmapItem[];
  sharepoint: SharePointData | null;
  stats: SchemaStats;
  strategy: Strategy;
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
