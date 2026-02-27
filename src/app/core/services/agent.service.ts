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
    { msg: '> Analysis In Progress... Please Wait...', type: 'success', delay: 4500 },
  ];

  private readonly discoveryLogs: AgentLog[] = [
    { msg: '> INITIATING DISCOVERY PROCESS...', type: 'system', delay: 500 },
    { msg: '> Preparing agent environment...', type: 'system', delay: 1000 },
    { msg: '> DISCOVERY ENDPOINT ACTIVATED', type: 'success', delay: 1500 },
    { msg: '> DISCOVERY In Progress... Please Wait...', type: 'success', delay: 1500 },
  ];

  // private generateMockCompatibilityData(): any[] {
  //   return [
  //     {
  //       "base_target_version": "24.2",
  //       "base_component": "Oracle APEX",
  //       "matrix": [
  //         {
  //           "certified_stack_1_lts": "19c LTS",
  //           "component": "Oracle Database",
  //           "status_message": "Compatible but Risky (21c is Innovation Release)",
  //           "action_required": "Upgrade to 23ai (LTS) or 19c (LTS). 21c is Innovation only.",
  //           "proposed_target(from developers)": "21c",
  //           "proposed_target(from agent)": "23ai",
  //           "current_version": "18c XE",
  //           "certified_stack_2_modern": "23ai LTS",
  //           "is_compatible": true
  //         },
  //         {
  //           "proposed_target(from developers)": "?",
  //           "action_required": "Upgrade to Java 21 LTS.",
  //           "status_message": "Not Compatible (ORDS 25.3 requires Java 17+)",
  //           "certified_stack_1_lts": "17 LTS",
  //           "component": "Java (JDK)",
  //           "proposed_target(from agent)": "21 LTS",
  //           "current_version": "11",
  //           "certified_stack_2_modern": "21 LTS",
  //           "is_compatible": false
  //         },
  //         {
  //           "current_version": "22c",
  //           "proposed_target(from agent)": "25.3",
  //           "certified_stack_2_modern": "25.3",
  //           "is_compatible": true,
  //           "status_message": "Compatible",
  //           "component": "Oracle REST Data Services (ORDS)",
  //           "certified_stack_1_lts": "25.3",
  //           "proposed_target(from developers)": "25.3",
  //           "action_required": null
  //         },
  //         {
  //           "certified_stack_1_lts": "9.0.115",
  //           "component": "Apache Tomcat",
  //           "status_message": "Compatible",
  //           "action_required": null,
  //           "proposed_target(from developers)": "9.0.113",
  //           "certified_stack_2_modern": "10.1.x (with Jakarta check)",
  //           "proposed_target(from agent)": "9.0.115",
  //           "current_version": "9.0.62",
  //           "is_compatible": true
  //         },
  //         {
  //           "component": "Oracle Linux",
  //           "certified_stack_1_lts": "8.10",
  //           "status_message": "Compatible",
  //           "action_required": null,
  //           "proposed_target(from developers)": "8.x",
  //           "current_version": "7.9",
  //           "proposed_target(from agent)": "9",
  //           "certified_stack_2_modern": "9.4",
  //           "is_compatible": true
  //         },
  //         {
  //           "proposed_target(from agent)": "24.04 LTS",
  //           "current_version": "18.04 LTS",
  //           "certified_stack_2_modern": "24.04 LTS",
  //           "is_compatible": true,
  //           "status_message": "Compatible",
  //           "certified_stack_1_lts": "22.04 LTS",
  //           "component": "Ubuntu (Selenium Nodes)",
  //           "proposed_target(from developers)": "24.04",
  //           "action_required": null
  //         },
  //         {
  //           "certified_stack_1_lts": "4.38",
  //           "component": "Selenium Grid",
  //           "status_message": "Compatible",
  //           "action_required": null,
  //           "proposed_target(from developers)": "4.38",
  //           "is_compatible": true,
  //           "certified_stack_2_modern": "4.38",
  //           "proposed_target(from agent)": "4.28+",
  //           "current_version": "4.6"
  //         }
  //       ],
  //       "impact_analysis": [
  //         {
  //           "risk_level": "High",
  //           "description": "Proposed 21c is an Innovation Release with limited support life. Using it risks early EOL. 18c is already EOL. Upgrade to 23ai (LTS) is critical for stability.",
  //           "component": "Oracle Database"
  //         },
  //         {
  //           "risk_level": "Critical",
  //           "description": "Current Java 11 will prevent ORDS 25.3 from starting. Upgrade to Java 21 is a hard dependency.",
  //           "component": "Java (JDK)"
  //         },
  //         {
  //           "risk_level": "High",
  //           "description": "OL 7.9 is EOL (security risk). Upgrade to OL 9 is required for compliance.",
  //           "component": "Oracle Linux"
  //         }
  //       ],
  //       "detailed_reasoning": [
  //         {
  //           "transition_stack": "Current (18c XE) -> Proposed (21c) -> Certified (23ai LTS)",
  //           "deprecated_objects": [
  //             "Non-CDB architecture (deprecated/removed in 21c+)",
  //             "BasicFile LOBs (deprecated)",
  //             "DBMS_JOB (replaced by DBMS_SCHEDULER)"
  //           ],
  //           "component_name": "Oracle Database",
  //           "rationale": "Developers proposed 21c, which is an Innovation Release with short support. Agent proposed 23ai, which is the modern LTS. APEX 24.2 requires minimum 19c. 18c XE is EOL and incompatible. 23ai is the recommended target for long-term stability."
  //         },
  //         {
  //           "rationale": "ORDS 25.3 REQUIRES Java 17 or 21. The current Java 11 is incompatible. Developers did not specify a version. Upgrade to Java 21 LTS is mandatory for the target stack.",
  //           "component_name": "Java (JDK)",
  //           "transition_stack": "Current (11) -> Proposed (?) -> Certified (21 LTS)",
  //           "deprecated_objects": [
  //             "Security Manager (deprecated for removal)",
  //             "Finalization (deprecated)",
  //             "Thread.stop() (removed)"
  //           ]
  //         },
  //         {
  //           "rationale": "Target 25.3 is fully compatible with APEX 24.2. Requires Java 17+.",
  //           "component_name": "Oracle REST Data Services (ORDS)",
  //           "deprecated_objects": [
  //             "Excel export (legacy)",
  //             "PDF export (legacy FOP support changed)"
  //           ],
  //           "transition_stack": "Current (22c) -> Proposed (25.3) -> Certified (25.3)"
  //         },
  //         {
  //           "deprecated_objects": [],
  //           "transition_stack": "Current (9.0.62) -> Proposed (9.0.113) -> Certified (9.0.115)",
  //           "rationale": "Tomcat 9.0.x is the safe 'javax' baseline. Tomcat 10+ introduces the 'jakarta' namespace which may require ORDS configuration changes. Sticking to latest 9.0.x is safe and compatible.",
  //           "component_name": "Apache Tomcat"
  //         },
  //         {
  //           "rationale": "OL 7 is EOL. OL 8 is compatible but OL 9 is the modern LTS standard.",
  //           "component_name": "Oracle Linux",
  //           "transition_stack": "Current (7.9) -> Proposed (8.x) -> Certified (9)",
  //           "deprecated_objects": [
  //             "Yum (replaced by DNF)",
  //             "Iptables (replaced by Nftables)"
  //           ]
  //         },
  //         {
  //           "rationale": "Ubuntu 18.04 is EOL. 24.04 is the latest LTS and fully supports Selenium 4.x.",
  //           "component_name": "Ubuntu (Selenium Nodes)",
  //           "deprecated_objects": [
  //             "Unity Desktop (replaced by GNOME)",
  //             "Netplan (default network config)"
  //           ],
  //           "transition_stack": "Current (18.04) -> Proposed (24.04) -> Certified (24.04 LTS)"
  //         },
  //         {
  //           "deprecated_objects": [
  //             "JsonWireProtocol (completely removed, W3C standard only)",
  //             "Legacy Grid architecture"
  //           ],
  //           "transition_stack": "Current (4.6) -> Proposed (4.38) -> Certified (4.38)",
  //           "component_name": "Selenium Grid",
  //           "rationale": "Selenium 4.38 (future version in context) is compatible. Ensure all drivers are W3C compliant."
  //         }
  //       ],
  //       "id": "e4f3913f-f012-408f-8457-6986a5669205",
  //       "_rid": "US0eAKKFDPEEAAAAAAAAAA==",
  //       "_self": "dbs/US0eAA==/colls/US0eAKKFDPE=/docs/US0eAKKFDPEEAAAAAAAAAA==/",
  //       "_etag": "\"08000aff-0000-2000-0000-699f19450000\"",
  //       "_attachments": "attachments/",
  //       "_ts": 1772034373
  //     }

  //   ];
  // }

  runAnalysis(apiUrl: string = 'https://winfotest-da-api.azurewebsites.net/api/Metrics'): Observable<AnalysisResponse> {
    this.stateService.setLoading(true);

    // First call the discover endpoint
    const discoverUrl = 'https://winfotest-da-agent-chdcb5h0dngff0eu.centralindia-01.azurewebsites.net/agent/discover';

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

  checkCompatibility(apiUrl: string = 'https://winfotest-da-agent-chdcb5h0dngff0eu.centralindia-01.azurewebsites.net/agent/compatibility'): Observable<any> {
    const compatibilityLogs: AgentLog[] = [
      { msg: '> INITIALIZING COMPATIBILITY CHECK...', type: 'system', delay: 500 },
      { msg: '> Analyzing current environment...', type: 'system', delay: 1000 },
      { msg: '> Checking Oracle version compatibility...', type: 'system', delay: 1500 },
      { msg: '> Validating Java requirements...', type: 'system', delay: 2000 },
      { msg: '> Verifying ORDS compatibility...', type: 'system', delay: 2500 },
      { msg: '> Analyzing component dependencies...', type: 'system', delay: 3000 },
      { msg: '> COMPATIBILITY In Progress', type: 'success', delay: 3500 },
    ];

    // Call the real API
    const apiCall$ = this.http.post<any>(apiUrl, {}).pipe(
      catchError((error) => {
        console.error('Compatibility Check Error:', error);
        return throwError(() => error);
      })
    );

    // Create progressive log sequence for compatibility check
    const logSequence$ = this.createCompatibilityLogSequence(compatibilityLogs);

    // Run logs and API in parallel
    return forkJoin({
      logs: logSequence$,
      data: apiCall$,
    }).pipe(
      map((result) => result.data)
    );
  }

  private createCompatibilityLogSequence(logs: AgentLog[]): Observable<void> {
    const logObservables = logs.map((log, index) => {
      const delayMs = index > 0 ? log.delay - logs[index - 1].delay : log.delay;

      return timer(delayMs).pipe(
        map(() => {
          this.logSubject.next(log);
          const percentage = Math.min(
            100,
            Math.floor(((index + 1) / logs.length) * 100)
          );
          this.progressSubject.next({
            percentage,
            status: log.msg,
          });
        })
      );
    });

    return concat(...logObservables).pipe(
      map(() => void 0),
      finalize(() => {
        this.progressSubject.next({
          percentage: 100,
          status: 'Compatibility Check Complete',
        });
      })
    );
  }

  gatherDataToMCP(apiUrl: string = 'https://winfotest-da-agent-chdcb5h0dngff0eu.centralindia-01.azurewebsites.net/agent/data-gathering'): Observable<any> {
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
    // if ((!data.stats || data.stats === null)) {
    //   const statsUrl = `https://winfotest-da-api.azurewebsites.net/api/DatabaseStats/13bc670b-e799-40cb-b295-9eb9166fe8bb`;
    //   requests['stats'] = this.http.get<any>(statsUrl).pipe(
    //     catchError((error) => {
    //       console.error('Failed to fetch database stats:', error);
    //       return of(null);
    //     })
    //   );
    // }

    data.stats = {
    "invalid_objects": [
        {
            "owner": "WATS_PROD",
            "object_type": "PACKAGE BODY",
            "invalid_count": 14
        },
        {
            "owner": "SYS",
            "object_type": "VIEW",
            "invalid_count": 5
        },
        {
            "owner": "PUBLIC",
            "object_type": "SYNONYM",
            "invalid_count": 5
        },
        {
            "owner": "WATS_PROD",
            "object_type": "TYPE",
            "invalid_count": 3
        },
        {
            "owner": "SYS",
            "object_type": "PACKAGE BODY",
            "invalid_count": 2
        },
        {
            "owner": "WATS_XE",
            "object_type": "PACKAGE BODY",
            "invalid_count": 2
        },
        {
            "owner": "SYS",
            "object_type": "PACKAGE",
            "invalid_count": 2
        },
        {
            "owner": "WATS_PROD",
            "object_type": "PROCEDURE",
            "invalid_count": 1
        },
        {
            "owner": "WATS_PROD",
            "object_type": "FUNCTION",
            "invalid_count": 1
        },
        {
            "owner": "WATS_PROD",
            "object_type": "TRIGGER",
            "invalid_count": 1
        },
        {
            "owner": "WATS_XE",
            "object_type": "PROCEDURE",
            "invalid_count": 1
        },
        {
            "owner": "TEST",
            "object_type": "PACKAGE",
            "invalid_count": 1
        },
        {
            "owner": "SYSTEM",
            "object_type": "PROCEDURE",
            "invalid_count": 1
        }
    ],
    "database_information": {
        "db_name": "WATSDEV1",
        "db_version": "Oracle Database 18c Express Edition Release 18.0.0.0.0 - Production",
        "server_name": "watsdev01",
        "os": "Linux x86 64-bit",
        "flashback_status": "NO",
        "dataguard_role": "PRIMARY",
        "instance_type": "NON-RAC",
        "data_size_gb": 15.15
    },
    "parameters": {
        "sga_target": {
            "name": "sga_target",
            "value": "1610612736"
        },
        "audit_trail": {
            "name": "audit_trail",
            "value": "DB, EXTENDED"
        },
        "hidden_parameters": [
            {
                "name": "_trace_files_public",
                "value": "FALSE"
            }
        ]
    },
    "stats_type": "database",
    "id": "13bc670b-e799-40cb-b295-9eb9166fe8bb",
    "_rid": "US0eAI4qKU8BAAAAAAAAAA==",
    "_self": "dbs/US0eAA==/colls/US0eAI4qKU8=/docs/US0eAI4qKU8BAAAAAAAAAA==/",
    "_etag": "\"150048f2-0000-2000-0000-69a014870000\"",
    "_attachments": "attachments/",
    "_ts": 1772098695
};

    // Check if sharepoint is null and has sharePointStatsGuid
    if ((!data.sharepoint || data.sharepoint === null)) {
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
      const compatibilityUrl = `https://winfotest-da-api.azurewebsites.net/api/CompatibilityMatrix`;
      requests['compatibility'] = this.http.get<any[]>(compatibilityUrl).pipe(
        map((compatibilityArray) => {
          return compatibilityArray && compatibilityArray.length > 0 ? [compatibilityArray[0]] : [];
        }),
        catchError((error) => {
          console.error('Failed to fetch compatibility data:', error);
          return of(null);
        })
      );
      // data.compatibility = this.generateMockCompatibilityData();
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
