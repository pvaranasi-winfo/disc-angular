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
  switchMap,
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

  private readonly discoveryLogs: AgentLog[] = [
    { msg: '> INITIATING DISCOVERY PROCESS...', type: 'system', delay: 500 },
    { msg: '> Preparing agent environment...', type: 'system', delay: 1000 },
    { msg: '> DISCOVERY ENDPOINT ACTIVATED', type: 'success', delay: 1500 },
  ];

  runAnalysis(apiUrl: string = 'https://winfotest-da-api.azurewebsites.net/api/Metrics'): Observable<AnalysisResponse> {
    this.stateService.setLoading(true);

    // First call the discover endpoint
    const discoverUrl = 'http://192.168.1.210:8001/agent/discover-duumy';
    
    // Show discovery logs during discover API call
    const discoveryLogSequence$ = this.createDiscoveryLogSequence();
    
    const discoverCall$ = this.http.post<any>(discoverUrl, {}).pipe(
      catchError((error) => {
        console.error('Discover API Error:', error);
        this.stateService.setError(error.message || 'Failed to discover agent');
        this.stateService.setLoading(false);
        return throwError(() => error);
      })
    );

    // Run discovery logs and API in parallel
    return forkJoin({
      logs: discoveryLogSequence$,
      discover: discoverCall$,
    }).pipe(
      switchMap((discoverResult) => {
        // If discover is successful (status 200), proceed with analysis

        // Call the real analysis API - returns an array
        const apiCall$ = this.http.get<AnalysisResponse[]>(apiUrl).pipe(
          catchError((error) => {
            console.error('API Error:', error);
            this.stateService.setError(error.message || 'Failed to fetch analysis data');
            return throwError(() => error);
          })
        );

        // Create progressive log sequence for analysis
        const logSequence$ = this.createLogSequence();

        // Run logs and API in parallel, wait for both to complete
        return forkJoin({
          logs: logSequence$,
          data: apiCall$,
        }).pipe(
          switchMap((result) => {
            // Get first object from the array
            const firstObject = result.data && result.data.length > 0 ? result.data[0] : null;
            if (!firstObject) {
              return throwError(() => new Error('No data returned from Metrics API'));
            }
            // Enrich the first object with stats and sharepoint if needed
            return this.enrichAnalysisData(firstObject);
          })
        );
      }),
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

  private createDiscoveryLogSequence(): Observable<void> {
    const logObservables = this.discoveryLogs.map((log, index) => {
      const delayMs = index > 0 ? log.delay - this.discoveryLogs[index - 1].delay : log.delay;

      return timer(delayMs).pipe(
        map(() => {
          this.logSubject.next(log);

          const percentage = ((index + 1) / this.discoveryLogs.length) * 100;
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
        this.progressSubject.next({
          percentage: 100,
          status: 'Discovery Complete',
        });
      })
    );
  }

  emitCompletion(data: AnalysisResponse): void {
    this.completionSubject.next(data);
  }

  gatherDataToMCP(apiUrl: string = 'http://192.168.1.210:8003/agent/data-gathering-dummy'): Observable<any> {
    const gatheringLogs: AgentLog[] = [
      { msg: '> INITIALIZING DATA GATHERING...', type: 'system', delay: 500 },
      { msg: '> Collecting OS information...', type: 'system', delay: 1000 },
      { msg: '> Retrieving GitHub information...', type: 'system', delay: 1500 },
      { msg: '> Fetching Oracle information...', type: 'system', delay: 2000 },
      { msg: '> Gathering SharePoint information...', type: 'system', delay: 2500 },
      { msg: '> DATA GATHERING COMPLETE', type: 'success', delay: 3000 },
    ];

    // Call the real API
    const apiCall$ = this.http.post<any>(apiUrl, {}).pipe(
      catchError((error) => {
        console.error('Data Gathering Error:', error);
        return throwError(() => error);
      })
    );

    // Create progressive log sequence for gathering
    const logSequence$ = this.createGatheringLogSequence(gatheringLogs);

    // Run logs and API in parallel
    return forkJoin({
      logs: logSequence$,
      data: apiCall$,
    }).pipe(
      map((result) => result.data)
    );
  }

  private createGatheringLogSequence(logs: AgentLog[]): Observable<void> {
    const logObservables = logs.map((log, index) => {
      const delayMs = index > 0 ? log.delay - logs[index - 1].delay : log.delay;

      return timer(delayMs).pipe(
        map(() => {
          this.logSubject.next(log);

          const percentage = ((index + 1) / logs.length) * 100;
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
        this.progressSubject.next({
          percentage: 100,
          status: 'Data Gathering Complete',
        });
      })
    );
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

  fetchAnalysisData(apiUrl: string = 'https://winfotest-da-api.azurewebsites.net/api/Metrics'): Observable<AnalysisResponse[]> {
    // Simple fetch without logs or discover endpoint - used for refresh
    return this.http.get<AnalysisResponse[]>(apiUrl).pipe(
      switchMap((responses) => {
        // Get first object from the array and enrich it
        if (responses && responses.length > 0) {
          return this.enrichAnalysisData(responses[0]).pipe(
            map((enriched) => [enriched])
          );
        }
        return of([]);
      }),
      catchError((error) => {
        console.error('Fetch Analysis Error:', error);
        return throwError(() => error);
      })
    );
  }

  private enrichAnalysisData(data: any): Observable<AnalysisResponse> {
    const requests: { [key: string]: Observable<any> } = {};

    // Check if stats is null and has databaseStatsGuid
    if ((!data.stats || data.stats === null) ) {
      const statsUrl = `https://winfotest-da-api.azurewebsites.net/api/DatabaseStats/13bc670b-e799-40cb-b295-9eb9166fe8bb`;
      requests['stats'] = this.http.get<any>(statsUrl).pipe(
        catchError((error) => {
          console.error('Failed to fetch database stats:', error);
          return of(null);
        })
      );
    }

    // Check if sharepoint is null and has sharePointStatsGuid
    if ((!data.sharepoint || data.sharepoint === null) ) {
      const sharepointUrl = `https://winfotest-da-api.azurewebsites.net/api/SharePointStats/8f5a8b72-683f-49ba-a47e-a9a355b187ee`;
      requests['sharepoint'] = this.http.get<any>(sharepointUrl).pipe(
        catchError((error) => {
          console.error('Failed to fetch sharepoint stats:', error);
          return of(null);
        })
      );
    }

    // If no additional requests needed, return data as is
    if (Object.keys(requests).length === 0) {
      return of(data);
    }

    // Fetch missing data and merge
    return forkJoin(requests).pipe(
      map((results) => {
        const enriched = { ...data };
        if (results['stats']) {
          enriched.stats = results['stats'];
        }
        if (results['sharepoint']) {
          enriched.sharepoint = results['sharepoint'];
        }
        return enriched;
      })
    );
  }
}
