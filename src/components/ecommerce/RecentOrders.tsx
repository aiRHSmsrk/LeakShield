
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// ---- KEV item (from your API) ----
interface KevItem {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  cwes?: Array<{ cweID?: string; description?: string }> | string[] | string | null;
  // other fields may exist; we only use the above
}

// ---- UI row we render (mapped from API) ----
interface Row {
  id: number;
  vendorProject: string;
  product: string;
  cveID: string;
  dateAdded: string;
  vulnerabilityName: string;
  cwesText: string;        // e.g., "CWE-79, CWE-89" or "—"
  cwesRisk: 'high' | 'medium' | 'low' | 'none';  // Risk level for color coding
  link: string;            // e.g., NVD link
}

// CWE Top 25 (2023) - Most Dangerous Software Weaknesses
const CWE_TOP_25 = new Set([
  'CWE-787', 'CWE-79', 'CWE-89', 'CWE-416', 'CWE-78', 'CWE-20', 'CWE-125',
  'CWE-22', 'CWE-352', 'CWE-434', 'CWE-862', 'CWE-476', 'CWE-287', 'CWE-190',
  'CWE-502', 'CWE-77', 'CWE-119', 'CWE-798', 'CWE-918', 'CWE-306', 'CWE-362',
  'CWE-269', 'CWE-94', 'CWE-863', 'CWE-276'
]);

// CWE Top 10 (highest priority)
const CWE_TOP_10 = new Set([
  'CWE-787', 'CWE-79', 'CWE-89', 'CWE-416', 'CWE-78', 'CWE-20', 'CWE-125',
  'CWE-22', 'CWE-352', 'CWE-434'
]);

// Known Exploited Vulnerabilities (KEV) CWEs - commonly exploited
const KEV_CWES = new Set([
  'CWE-79', 'CWE-89', 'CWE-78', 'CWE-22', 'CWE-352', 'CWE-434', 'CWE-287',
  'CWE-502', 'CWE-77', 'CWE-798', 'CWE-918', 'CWE-94', 'CWE-863'
]);

// CWE risk data (simplified CVSS mapping and frequency)
const CWE_RISK_DATA: Record<string, { meanCVSS: number; maxCVSS: number; frequency: number }> = {
  'CWE-787': { meanCVSS: 8.1, maxCVSS: 9.8, frequency: 0.15 }, // Out-of-bounds Write
  'CWE-79': { meanCVSS: 6.1, maxCVSS: 9.6, frequency: 0.12 },  // Cross-site Scripting
  'CWE-89': { meanCVSS: 7.5, maxCVSS: 10.0, frequency: 0.08 }, // SQL Injection
  'CWE-416': { meanCVSS: 7.8, maxCVSS: 9.8, frequency: 0.06 }, // Use After Free
  'CWE-78': { meanCVSS: 8.6, maxCVSS: 10.0, frequency: 0.05 }, // OS Command Injection
  'CWE-20': { meanCVSS: 6.8, maxCVSS: 9.3, frequency: 0.07 },  // Improper Input Validation
  'CWE-125': { meanCVSS: 6.5, maxCVSS: 9.1, frequency: 0.04 }, // Out-of-bounds Read
  'CWE-22': { meanCVSS: 6.1, maxCVSS: 9.1, frequency: 0.03 },  // Path Traversal
  'CWE-352': { meanCVSS: 6.8, maxCVSS: 8.8, frequency: 0.03 }, // CSRF
  'CWE-434': { meanCVSS: 8.8, maxCVSS: 10.0, frequency: 0.02 }, // Unrestricted Upload
  'CWE-862': { meanCVSS: 7.5, maxCVSS: 9.8, frequency: 0.02 }, // Missing Authorization
  'CWE-476': { meanCVSS: 5.5, maxCVSS: 7.5, frequency: 0.02 }, // NULL Pointer Dereference
  'CWE-287': { meanCVSS: 9.8, maxCVSS: 10.0, frequency: 0.02 }, // Improper Authentication
  'CWE-190': { meanCVSS: 5.0, maxCVSS: 9.3, frequency: 0.02 }, // Integer Overflow
  'CWE-502': { meanCVSS: 9.8, maxCVSS: 10.0, frequency: 0.01 }, // Deserialization
  'CWE-77': { meanCVSS: 8.1, maxCVSS: 10.0, frequency: 0.01 },  // Command Injection
  'CWE-119': { meanCVSS: 6.9, maxCVSS: 9.3, frequency: 0.01 }, // Buffer Errors
  'CWE-798': { meanCVSS: 9.8, maxCVSS: 10.0, frequency: 0.01 }, // Hard-coded Credentials
  'CWE-918': { meanCVSS: 8.6, maxCVSS: 10.0, frequency: 0.01 }, // SSRF
  'CWE-306': { meanCVSS: 9.8, maxCVSS: 10.0, frequency: 0.01 }, // Missing Authentication
  'CWE-362': { meanCVSS: 6.8, maxCVSS: 8.1, frequency: 0.01 }, // Race Condition
  'CWE-269': { meanCVSS: 8.8, maxCVSS: 10.0, frequency: 0.01 }, // Improper Privilege Management
  'CWE-94': { meanCVSS: 8.8, maxCVSS: 10.0, frequency: 0.01 },  // Code Injection
  'CWE-863': { meanCVSS: 7.5, maxCVSS: 9.1, frequency: 0.01 }, // Incorrect Authorization
  'CWE-276': { meanCVSS: 6.8, maxCVSS: 8.8, frequency: 0.01 }, // Incorrect Default Permissions
};

// Calculate CWE risk score based on the provided formula
function calculateCWERisk(cweId: string, allCweCounts: Record<string, number>, totalCves: number): number {
  const riskData = CWE_RISK_DATA[cweId];
  if (!riskData) {
    // Default values for unknown CWEs
    return 0.2; // Low risk by default
  }

  // Normalize CVSS scores (0-10 to 0-1)
  const m_prime = riskData.meanCVSS / 10;
  const M_prime = riskData.maxCVSS / 10;

  // Frequency share
  const count_w = allCweCounts[cweId] || 1;
  const total_count = Object.values(allCweCounts).reduce((sum, count) => sum + count, 0) || totalCves;
  const f = count_w / total_count;

  // Recency share (simplified - assume recent if in current dataset)
  const r = 0.5; // Moderate recency since these are active vulnerabilities

  // KEV indicator
  const k = KEV_CWES.has(cweId) ? 1 : 0;

  // Top 25 indicator
  const t = CWE_TOP_25.has(cweId) ? 1 : 0;

  // Calculate risk score using the provided formula
  const risk = 0.35 * m_prime + 0.15 * M_prime + 0.20 * Math.min(4 * f, 1) + 0.10 * r + 0.15 * k + 0.05 * t;

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, risk));
}

// Determine risk level and color for CWE
function getCWERiskLevel(cweIds: string[], allCweCounts: Record<string, number>, totalCves: number): 'high' | 'medium' | 'low' | 'none' {
  if (!cweIds.length || (cweIds.length === 1 && cweIds[0] === '—')) {
    return 'none';
  }

  let maxRisk = 0;
  let hasKevCwe = false;
  let hasTop10Cwe = false;
  let hasTop25Cwe = false;

  for (const cweId of cweIds) {
    const cleanCweId = cweId.trim();
    if (!cleanCweId || cleanCweId === '—') continue;

    const risk = calculateCWERisk(cleanCweId, allCweCounts, totalCves);
    maxRisk = Math.max(maxRisk, risk);

    if (KEV_CWES.has(cleanCweId)) hasKevCwe = true;
    if (CWE_TOP_10.has(cleanCweId)) hasTop10Cwe = true;
    if (CWE_TOP_25.has(cleanCweId)) hasTop25Cwe = true;
  }

  // Apply color mapping rules
  if (maxRisk >= 0.66 || hasKevCwe || hasTop10Cwe) {
    return 'high';
  } else if (maxRisk >= 0.33 || hasTop25Cwe) {
    return 'medium';
  } else {
    return 'low';
  }
}

const NGROK_URL = "https://005b38a5e9eb.ngrok-free.app/vulnerabilities";
const NGROK_HEADERS: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

export default function RecentOrders() {
  const [rows, setRows] = useState<Row[]>([]);
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([]);
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    product: '',
    vendorProject: '',
    cveID: '',
    dateRange: 'all', // 'all', 'last7days', 'last30days', 'last90days'
    vulnerabilityName: '',
    cwes: ''
  });

  useEffect(() => {
    const fetchVulnerabilities = async () => {
      try {
        setLoading(true);
        const res = await fetch(NGROK_URL, {
          headers: NGROK_HEADERS,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: KevItem[] = await res.json();

        console.log("[VULNS] response:", data);

        // Map API objects to table rows
        const mapped: Row[] = (data ?? []).map((item, idx) => {
          // Normalize CWEs into a compact string
          let cwesText = "—";
          
          if (Array.isArray(item.cwes)) {
            // Could be array of strings or array of objects with cweID
            const parts = item.cwes
              .map((c: any) => {
                if (typeof c === "string") return c;
                if (c && typeof c === "object" && (c.cweID || c.description)) {
                  return c.cweID ?? c.description ?? "";
                }
                return "";
              })
              .filter(Boolean);
            if (parts.length > 0) {
              cwesText = parts.join(", ");
            }
          } else if (typeof item.cwes === "string" && item.cwes.trim().length > 0) {
            cwesText = item.cwes;
          }

          return {
            id: idx + 1,
            vendorProject: item.vendorProject ?? "",
            product: item.product ?? "",
            cveID: item.cveID ?? "",
            dateAdded: item.dateAdded ?? "",
            vulnerabilityName: item.vulnerabilityName ?? "",
            cwesText,
            cwesRisk: 'low' as const, // Will be calculated after all data is processed
            link: item.cveID
              ? `https://nvd.nist.gov/vuln/detail/${encodeURIComponent(item.cveID)}`
              : "#",
          };
        });

        // Calculate CWE counts for risk assessment
        const cweCounts: Record<string, number> = {};
        mapped.forEach(row => {
          if (row.cwesText && row.cwesText !== "—") {
            const cweIds = row.cwesText.split(',').map(c => c.trim());
            cweIds.forEach(cweId => {
              if (cweId && cweId !== "—") {
                cweCounts[cweId] = (cweCounts[cweId] || 0) + 1;
              }
            });
          }
        });

        // Update risk levels for each row
        mapped.forEach(row => {
          if (row.cwesText && row.cwesText !== "—") {
            const cweIds = row.cwesText.split(',').map(c => c.trim());
            row.cwesRisk = getCWERiskLevel(cweIds, cweCounts, data.length);
          } else {
            row.cwesRisk = 'none';
          }
        });

        setAllRows(mapped);
        setFilteredRows(mapped);
        setRows(mapped.slice(0, displayLimit));
      } catch (err) {
        console.error("[VULNS] fetch failed:", err);
        setRows([]); // keep UI stable
        setAllRows([]);
        setFilteredRows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVulnerabilities();
  }, [displayLimit]);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...allRows];

    // Filter by product
    if (filters.product.trim()) {
      filtered = filtered.filter(row => 
        row.product.toLowerCase().includes(filters.product.toLowerCase())
      );
    }

    // Filter by vendor/project
    if (filters.vendorProject.trim()) {
      filtered = filtered.filter(row => 
        row.vendorProject.toLowerCase().includes(filters.vendorProject.toLowerCase())
      );
    }

    // Filter by CVE ID
    if (filters.cveID.trim()) {
      filtered = filtered.filter(row => 
        row.cveID.toLowerCase().includes(filters.cveID.toLowerCase())
      );
    }

    // Filter by vulnerability name
    if (filters.vulnerabilityName.trim()) {
      filtered = filtered.filter(row => 
        row.vulnerabilityName.toLowerCase().includes(filters.vulnerabilityName.toLowerCase())
      );
    }

    // Filter by CWEs
    if (filters.cwes.trim()) {
      filtered = filtered.filter(row => 
        row.cwesText.toLowerCase().includes(filters.cwes.toLowerCase())
      );
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === 'last7days' ? 7 : 
                   filters.dateRange === 'last30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      filtered = filtered.filter(row => {
        const rowDate = new Date(row.dateAdded);
        return rowDate >= cutoffDate;
      });
    }

    setFilteredRows(filtered);
    setRows(filtered.slice(0, displayLimit));
  }, [filters, allRows, displayLimit]);

  const handleSeeAll = () => {
    if (rows.length < filteredRows.length) {
      // Show all filtered data
      setRows(filteredRows);
    } else {
      // Reset to initial limit
      setRows(filteredRows.slice(0, 10));
    }
  };

  const isShowingAll = rows.length === filteredRows.length && filteredRows.length > 10;

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      product: '',
      vendorProject: '',
      cveID: '',
      dateRange: 'all',
      vulnerabilityName: '',
      cwes: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Exploited Vulnerabilities
          </h3>
          {allRows.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Showing {rows.length} of {filteredRows.length} vulnerabilities
              {hasActiveFilters && ` (${allRows.length} total)`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-theme-sm font-medium shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
              hasActiveFilters 
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
            {hasActiveFilters && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {Object.values(filters).filter(v => v !== '' && v !== 'all').length}
              </span>
            )}
          </button>
          <button 
            onClick={handleSeeAll}
            disabled={loading || filteredRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : isShowingAll ? (
              "Show Less"
            ) : (
              `See All (${filteredRows.length})`
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product
              </label>
              <input
                type="text"
                value={filters.product}
                onChange={(e) => handleFilterChange('product', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Vendor/Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor/Project
              </label>
              <input
                type="text"
                value={filters.vendorProject}
                onChange={(e) => handleFilterChange('vendorProject', e.target.value)}
                placeholder="Search vendors..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* CVE ID Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVE ID
              </label>
              <input
                type="text"
                value={filters.cveID}
                onChange={(e) => handleFilterChange('cveID', e.target.value)}
                placeholder="Search CVE IDs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Vulnerability Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vulnerability
              </label>
              <input
                type="text"
                value={filters.vulnerabilityName}
                onChange={(e) => handleFilterChange('vulnerabilityName', e.target.value)}
                placeholder="Search vulnerabilities..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* CWE Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CWEs
              </label>
              <input
                type="text"
                value={filters.cwes}
                onChange={(e) => handleFilterChange('cwes', e.target.value)}
                placeholder="Search CWEs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? (
                `${Object.values(filters).filter(v => v !== '' && v !== 'all').length} filter(s) active`
              ) : (
                'No filters applied'
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilter(false)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-64"
              >
                Product
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-32"
              >
               CVE ID
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24"
              >
               Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-80"
              >
                Vulnerability 
              </TableCell>
               <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-32"
              >
                CWEs
              </TableCell>
               <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-24"
              >
                Links 
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((item) => (
              <TableRow key={item.id} className="">
                {/* Product */}
                <TableCell className="py-3 w-64">
                  <div className="flex items-center gap-3">
                    {/* (image block remains commented out as in your original) */}
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.product}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {item.vendorProject}
                        
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* CVE ID */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-32">
                  {item.cveID}
                </TableCell>

                {/* Date */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-24">
                  {item.dateAdded}
                </TableCell>

                {/* Vulnerability */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-80">
                  {item.vulnerabilityName}
                </TableCell>

                {/* CWEs with risk-based color coding */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-32">
                  {item.cwesRisk === 'none' ? (
                    <Badge size="sm" color="light">
                      {item.cwesText || "—"}
                    </Badge>
                  ) : (
                    <div className="inline-flex items-center gap-1">
                      <Badge 
                        size="sm" 
                        color={
                          item.cwesRisk === 'high' ? 'error' : 
                          item.cwesRisk === 'medium' ? 'warning' : 'success'
                        }
                        startIcon={
                          item.cwesRisk === 'high' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : item.cwesRisk === 'medium' ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )
                        }
                      >
                        {item.cwesText || "—"}
                      </Badge>
                    </div>
                  )}
                </TableCell>

                {/* Links */}
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 w-24">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Details
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

