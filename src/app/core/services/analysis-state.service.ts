import { Injectable, signal, computed } from '@angular/core';
import { AnalysisResponse } from '../../models/analysis-response.model';

@Injectable({
  providedIn: 'root',
})
export class AnalysisStateService {
  private readonly analysisData = signal<AnalysisResponse | null>(null);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Public readonly signals
  readonly data = this.analysisData.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly errorMessage = this.error.asReadonly();

  // Computed derived values
  readonly hasSharePointData = computed(() => {
    const data = this.analysisData();
    return data?.sharepoint !== null && data?.sharepoint !== undefined;
  });

  readonly invalidObjectsCount = computed(() => {
    const data = this.analysisData();
    if (!data?.stats?.invalid_objects) return 0;
    return data.stats.invalid_objects.reduce((sum, obj) => sum + obj.invalid_count, 0);
  });

  readonly storageInGB = computed(() => {
    const data = this.analysisData();
    if (!data?.sharepoint?.storage_used_bytes) return 0;
    return (data.sharepoint.storage_used_bytes / (1024 * 1024 * 1024)).toFixed(2);
  });

  setAnalysisData(data: AnalysisResponse): void {
    this.analysisData.set(data);
    this.error.set(null);
  }

  setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  setError(errorMsg: string): void {
    this.error.set(errorMsg);
    this.loading.set(false);
  }

  clearError(): void {
    this.error.set(null);
  }

  reset(): void {
    this.analysisData.set(null);
    this.loading.set(false);
    this.error.set(null);
  }
}
