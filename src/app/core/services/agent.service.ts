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

  private readonly mockCompatibilityData = [
    {
      id: '8a39517d-7a3e-40c4-b3f6-fddb59bcae39',
      base_component: 'Oracle APEX',
      base_target_version: '24.2',
      architectural_rationale: null,
      matrix: [
        {
          certified_stack_2_modern: 'Oracle Database 23ai',
          proposed_target: '23ai',
          action_required: null,
          status_message: 'Compatible (Certified)',
          component: 'Oracle Database',
          is_compatible: true,
          certified_stack_1_lts: 'Oracle Database 19c (19.24+)',
          brief_rationale: null,
          current_version: '18c XE',
        },
        {
          certified_stack_2_modern: 'ORDS 25.x (Latest)',
          proposed_target: '25.4',
          action_required: 'Verify Release Availability',
          status_message: 'Compatible (Projected Future Release)',
          component: 'ORDS',
          is_compatible: true,
          certified_stack_1_lts: 'ORDS 24.4 LTS',
          brief_rationale: null,
          current_version: '22c',
        },
        {
          certified_stack_2_modern: 'Java 21 LTS',
          proposed_target: '21',
          action_required: null,
          status_message: 'Compatible',
          component: 'Java Runtime',
          is_compatible: true,
          certified_stack_1_lts: 'Java 17 LTS',
          brief_rationale: null,
          current_version: 'Legacy (8/11)',
        },
        {
          certified_stack_2_modern: 'ORDS Standalone (Jetty)',
          proposed_target: 'Tomcat 9.0.Latest',
          action_required: 'Consider Standalone Mode',
          status_message: 'Compatible',
          component: 'Web Server (Tomcat)',
          is_compatible: true,
          certified_stack_1_lts: 'Tomcat 9.0.x',
          brief_rationale: null,
          current_version: 'Tomcat Legacy',
        },
        {
          certified_stack_2_modern: 'Oracle Linux 9',
          proposed_target: 'Oracle Linux 9',
          action_required: null,
          status_message: 'Compatible',
          component: 'Operating System (DB/App)',
          is_compatible: true,
          certified_stack_1_lts: 'Oracle Linux 8',
          brief_rationale: null,
          current_version: 'Oracle Linux 7.9',
        },
        {
          certified_stack_2_modern: 'Ubuntu 24.04 LTS',
          proposed_target: 'Ubuntu 24.04 LTS',
          action_required: null,
          status_message: 'Compatible',
          component: 'Operating System (Selenium)',
          is_compatible: true,
          certified_stack_1_lts: 'Ubuntu 22.04 LTS',
          brief_rationale: null,
          current_version: 'Ubuntu 18.04 LTS',
        },
      ],
      detailed_reasoning: [
        {
          transition_stack: 'Current (18c XE) -> Proposed (23ai) -> Certified (23ai)',
          rationale:
            "Oracle Database 23ai is the latest Long Term Release (LTS) and is fully certified with APEX 24.2. The transition from 18c XE to 23ai Enterprise/Free offers significant performance improvements and AI capabilities (Vector Search). Ensure 'COMPATIBLE' parameter is set to 23.0.0.",
          deprecated_objects: [
            'DBMS_JOB (Replaced by DBMS_SCHEDULER)',
            'Oracle Multimedia (ORDImage)',
            'Traditional Auditing (Replaced by Unified Auditing)',
            'UTL_FILE (Stricter directory access)',
          ],
          component_name: 'Oracle Database',
        },
        {
          transition_stack: 'Current (22c) -> Proposed (25.4) -> Certified (24.4 LTS / 25.x)',
          rationale:
            'ORDS 25.4 is a projected future release (likely Q4 2025/Q1 2026). Current stable is 24.4. APEX 24.2 requires ORDS 23.3+. Using the latest ORDS ensures support for Java 21 and HTTP/2. We recommend validating 25.4 upon release or using 24.4 LTS.',
          deprecated_objects: [
            'Apache FOP (PDF Printing) - External service recommended',
            'XML-based configuration (Fully replaced by folder-based configuration)',
            'Legacy URL syntax (if not already migrated)',
          ],
          component_name: 'ORDS',
        },
        {
          transition_stack: 'Current (11/8) -> Proposed (21) -> Certified (21 LTS)',
          rationale:
            'Java 21 LTS is the recommended runtime for modern ORDS (24.2+) and offers Virtual Threads (Project Loom) for improved throughput. Java 17 LTS is also supported but 21 is preferred for long-term support alignment with the 2026 roadmap.',
          deprecated_objects: [
            'Security Manager (Deprecated for removal)',
            'Legacy 32-bit support (Removed in modern builds)',
          ],
          component_name: 'Java Runtime',
        },
        {
          transition_stack: 'Current (Tomcat 8/9) -> Proposed (Tomcat 9.0.Latest) -> Certified (Standalone / Tomcat 9)',
          rationale:
            "Tomcat 9.0.x is the standard 'javax' based container certified for ORDS. While Tomcat 10 (Jakarta EE) is available, ORDS Standalone (Embedded Jetty) is the preferred modern deployment for simplified management and HTTP/2 support.",
          deprecated_objects: ['Legacy AJP Connector attributes', 'BioConnector (Removed in favor of NIO)'],
          component_name: 'Web Server (Tomcat)',
        },
        {
          transition_stack: 'Current (OL 7.9) -> Proposed (OL 9) -> Certified (OL 9)',
          rationale:
            'Oracle Linux 9 is the certified OS for Oracle Database 23ai and offers the latest kernel support for containerization (Podman). It aligns perfectly with the target stack.',
          deprecated_objects: [
            'Yum (Replaced by DNF)',
            'Iptables (Replaced by Nftables/Firewalld)',
            'Network Scripts (Replaced by NetworkManager)',
          ],
          component_name: 'Operating System (DB/App)',
        },
        {
          transition_stack: 'Current (Ubuntu 18.04) -> Proposed (Ubuntu 24.04) -> Certified (Ubuntu 24.04)',
          rationale:
            'Ubuntu 24.04 LTS provides the necessary glibc versions for the latest Chrome/Gecko drivers and Selenium Grid 4.x. Ubuntu 18.04 is EOL and unsafe.',
          deprecated_objects: ['Legacy X11 forwarding (Wayland is default)', 'Python 2 (Removed)'],
          component_name: 'Operating System (Selenium)',
        },
      ],
    }
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

    // Check if compatibility data is missing
    if (!data.compatibility || data.compatibility === null) {
      // Using mock data temporarily - uncomment below to use API endpoint
      // const compatibilityUrl = `https://winfotest-da-api.azurewebsites.net/api/Compatibility`;
      // requests['compatibility'] = this.http.get<any>(compatibilityUrl).pipe(
      //   catchError((error) => {
      //     console.error('Failed to fetch compatibility data:', error);
      //     return of(null);
      //   })
      // );
      
      // Use mock data for now
      requests['compatibility'] = of(this.mockCompatibilityData);
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
        if (results['compatibility']) {
          enriched.compatibility = results['compatibility'];
        }
        return enriched;
      })
    );
  }
}
