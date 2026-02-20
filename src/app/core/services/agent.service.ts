import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  Subject,
  concat,
  of,
  timer,
  forkJoin,
  throwError,
  catchError,
  map,
  finalize,
} from 'rxjs';
import { AgentLog, AgentProgress } from '../../models/agent-log.model';
import { AnalysisResponse } from '../../models/analysis-response.model';
import { AnalysisStateService } from './analysis-state.service';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly http = inject(HttpClient);
  private readonly stateService = inject(AnalysisStateService);

  private readonly logSubject = new Subject<AgentLog>();
  private readonly progressSubject = new Subject<AgentProgress>();
  private readonly completionSubject = new Subject<AnalysisResponse>();

  readonly logs$ = this.logSubject.asObservable();
  readonly progress$ = this.progressSubject.asObservable();
  readonly completion$ = this.completionSubject.asObservable();

  private readonly agentLogs: AgentLog[] = [
    { msg: '> INITIALIZING DISCOVERY AGENT...', type: 'system', delay: 500 },
    { msg: '> Connecting to local OCI environment...', type: 'system', delay: 800 },
    { msg: '> FOUND: Legacy Oracle 18c XE Instance', type: 'success', delay: 1000 },
    { msg: '> SCANNING SCHEMA: WATS_PROD', type: 'system', delay: 1200 },
    { msg: '> INFO: 24 Tables identified', type: 'system', delay: 1500 },
    {
      msg: '> WARNING: Deprecated data types detected (LONG, VARCHAR2)',
      type: 'warning',
      delay: 2000,
    },
    { msg: '> ANALYZING UPGRADE COMPATIBILITY...', type: 'system', delay: 2500 },
    { msg: '> Checking 21c Feature Alignment...', type: 'system', delay: 3000 },
    { msg: '> FETCHING SHAREPOINT DIAGNOSTICS...', type: 'system', delay: 3500 },
    { msg: '> COMPILING FINAL REPORT...', type: 'success', delay: 4500 },
  ];

  runAnalysis(apiUrl: string = 'http://127.0.0.1:5000/api/analyze'): Observable<AnalysisResponse> {
    this.stateService.setLoading(true);

    // Call the real API
    const apiCall$ = this.http.get<AnalysisResponse>(apiUrl).pipe(
      catchError((error) => {
        console.error('API Error:', error);
        this.stateService.setError(error.message || 'Failed to fetch analysis data');
        return throwError(() => error);
      })
    );

    // Create progressive log sequence
    const logSequence$ = this.createLogSequence();

    // Run logs and API in parallel, wait for both to complete
    return forkJoin({
      logs: logSequence$,
      data: apiCall$,
    }).pipe(
      map((result) => result.data),
      finalize(() => {
        this.stateService.setLoading(false);
      })
    );
  }

  private createLogSequence(): Observable<void> {
    const logObservables = this.agentLogs.map((log, index) => {
      const delayMs = index > 0 ? log.delay - this.agentLogs[index - 1].delay : log.delay;

      return timer(delayMs).pipe(
        map(() => {
          this.logSubject.next(log);

          const percentage = ((index + 1) / this.agentLogs.length) * 100;
          this.progressSubject.next({
            percentage,
            status: log.msg.replace('> ', ''),
          });
        })
      );
    });

    return concat(...logObservables).pipe(
      map(() => void 0),
      finalize(() => {
        // Ensure progress reaches 100%
        this.progressSubject.next({
          percentage: 100,
          status: 'Analysis Complete',
        });
      })
    );
  }

  emitCompletion(data: AnalysisResponse): void {
    this.completionSubject.next(data);
  }

  showQuickStatus(): void {
    // Show brief status messages without re-running full analysis
    const quickLogs: AgentLog[] = [
      { msg: '> LOADING EXISTING ANALYSIS...', type: 'system', delay: 200 },
      { msg: '> Analysis already available', type: 'success', delay: 500 },
      { msg: '> Displaying cached results...', type: 'success', delay: 800 },
    ];

    quickLogs.forEach((log, index) => {
      setTimeout(() => {
        this.logSubject.next(log);
        const percentage = ((index + 1) / quickLogs.length) * 100;
        this.progressSubject.next({
          percentage,
          status: log.msg.replace('> ', ''),
        });
      }, log.delay);
    });
  }

  resetLogs(): void {
    this.logSubject.next({ msg: '', type: 'system', delay: 0 });
  }
}
