import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AnalysisResponse } from '../../models/analysis-response.model';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  getMockAnalysisData(): Observable<AnalysisResponse> {
    const mockData: AnalysisResponse = {
      comparison: [
        {
          component: 'Database Engine',
          current: 'Oracle 18c XE',
          recommended: 'Oracle 21c (LTS)',
          why: 'Native JSON type, Blockchain tables, and Long Term Support.',
        },
        {
          component: 'Operating System',
          current: 'Ubuntu 18.04',
          recommended: 'Ubuntu 22.04 LTS',
          why: 'Security patching for 18.04 has ended; 22.04 is required for 21c.',
        },
        {
          component: 'Java Runtime',
          current: 'OpenJDK 8',
          recommended: 'OpenJDK 11/17',
          why: 'Improved performance and compatibility with modern SpringBoot/Quartz.',
        },
      ],
      recommendations: [
        {
          description:
            'Oracle 21c provides immutable blockchain tables. Consider migrating sensitive audit/log tables to blockchain tables for enhanced tamper-protection.',
          feature: 'Blockchain Tables',
          impacted_objects: [
            'AUDIT_SCRIPT_EXECUTION_TRAIL',
            'AUDIT_STAGE_LOOKUP',
            'EXECUTE_STATUS_LOG',
            'HTE_AUDIT_SCRIPT_EXECUTION_TRAIL',
            'HTE_WIN_TA_EXECUTION_AUDIT',
          ],
        },
      ],
      roadmap: [
        {
          application: 'Oracle Linux',
          current: '7.9',
          guideline: 'Fresh install or Yum upgrade.',
          observation: 'Baseline stability for 21c.',
          target: '8.x',
        },
        {
          application: 'Ubuntu Desktop',
          current: '18.02 LTS',
          guideline: 'Use do-release-upgrade.',
          observation: 'Modern LTS platform.',
          target: '24.04',
        },
        {
          application: 'Oracle Database',
          current: '18c XE',
          guideline: 'Use Oracle AutoUpgrade tool.',
          observation: 'Transition to Multitenant.',
          target: '21c',
        },
        {
          application: 'Oracle APEX',
          current: '22c',
          guideline: 'Export/Import & run Advisor.',
          observation: 'Enhanced UI and AI features.',
          target: '24.2',
        },
      ],
      sharepoint: {
        file_category_distribution: {
          'deployment-documentation': 2,
          'financial-document': 2,
          other: 27,
          presentation: 1,
          'project-plan': 2,
          report: 2,
          'technical-specification': 1,
          'user-manual': 1,
        },
        file_samples: [
          {
            name: 'Microsoft Copilot Chat Files',
            site: 'Murali Thokala',
            size: 0,
          },
          {
            name: 'Apps',
            site: 'sumera bhanu',
            size: 0,
          },
          {
            name: 'Advertising guidance',
            site: 'Winfo-Intranet',
            size: 0,
          },
          {
            name: 'Email templates',
            site: 'Winfo-Intranet',
            size: 0,
          },
          {
            name: 'Event assets',
            site: 'Winfo-Intranet',
            size: 0,
          },
          {
            name: 'Presentation templates',
            site: 'Winfo-Intranet',
            size: 0,
          },
        ],
        site_type_distribution: {
          'Personal/OneDrive': 25,
          'SharePoint Site': 21,
        },
        storage_used_bytes: 884554166,
        total_files: 38,
        total_sites: 46,
      },
      stats: {
        id: 'mock-db-stats-001',
        stats_type: 'database',
        invalid_objects: [
          {
            owner: 'WATS_PROD',
            object_type: 'PACKAGE BODY',
            invalid_count: 14,
          },
          {
            owner: 'SYS',
            object_type: 'VIEW',
            invalid_count: 5,
          },
          {
            owner: 'PUBLIC',
            object_type: 'SYNONYM',
            invalid_count: 5,
          },
          {
            owner: 'WATS_PROD',
            object_type: 'TYPE',
            invalid_count: 3,
          },
        ],
        database_information: {
          db_name: 'WATSDEV1',
          db_version: 'Oracle Database 18c Express Edition Release 18.0.0.0.0 - Production',
          server_name: 'watsdev01',
          os: 'Linux x86 64-bit',
          flashback_status: 'NO',
          dataguard_role: 'PRIMARY',
          instance_type: 'NON-RAC',
          data_size_gb: 15.15,
        },
        parameters: {
          sga_target: {
            name: 'sga_target',
            value: '1610612736',
          },
          audit_trail: {
            name: 'audit_trail',
            value: 'DB, EXTENDED',
          },
          hidden_parameters: [
            {
              name: '_trace_files_public',
              value: 'FALSE',
            },
          ],
        },
      },
      strategy: {
        how: 'Use Oracle Data Pump for a "Side-by-Side" migration. Perform a schema-only migration first, followed by data validation.',
        when: 'Phase 1 (Preparation): Q2 2026 | Phase 2 (Migration): Q3 2026.',
      },
    };

    // Simulate API delay
    return of(mockData).pipe(delay(1000));
  }
}
