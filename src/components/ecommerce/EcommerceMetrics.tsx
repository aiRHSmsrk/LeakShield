import { useEffect, useState } from "react";
import {
  // ArrowDownIcon,
  ArrowUpIcon,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { API_URLS, API_CONFIG } from "../../config/api";

interface VulnerabilityMetrics {
  totalVulnerabilities: number;
  highSeverityCount: number;
  uniqueVendors: number;
  recentVulns: number;
  weeklyChange: number;
  monthlyChange: number;
}

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState<VulnerabilityMetrics>({
    totalVulnerabilities: 0,
    highSeverityCount: 0,
    uniqueVendors: 0,
    recentVulns: 0,
    weeklyChange: 0,
    monthlyChange: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndCalculateMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URLS.VULNERABILITIES, {
          headers: API_CONFIG.HEADERS.NGROK_HEADERS,
          cache: API_CONFIG.OPTIONS.CACHE,
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Calculate metrics from vulnerability data
        const totalVulnerabilities = data.length;
        
        // Count unique vendors
        const uniqueVendors = new Set(
          data.map((item: any) => item.vendorProject).filter(Boolean)
        ).size;

        // Count vulnerabilities from last 7 days
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const recentVulns = data.filter((item: any) => {
          const itemDate = new Date(item.dateAdded);
          return itemDate >= sevenDaysAgo;
        }).length;

        const lastWeekVulns = data.filter((item: any) => {
          const itemDate = new Date(item.dateAdded);
          return itemDate >= sevenDaysAgo;
        }).length;

        const lastMonthVulns = data.filter((item: any) => {
          const itemDate = new Date(item.dateAdded);
          return itemDate >= thirtyDaysAgo;
        }).length;

        // Simulate severity count (since we don't have severity in the data)
        // In a real scenario, you'd have severity data from your API
        const highSeverityCount = Math.floor(totalVulnerabilities * 0.3); // Assume 30% are high severity

        // Calculate percentage changes (simulated)
        const weeklyChange = lastWeekVulns > 0 ? ((lastWeekVulns / totalVulnerabilities) * 100) : 0;
        const monthlyChange = lastMonthVulns > 0 ? ((lastMonthVulns / totalVulnerabilities) * 100) : 0;

        setMetrics({
          totalVulnerabilities,
          highSeverityCount,
          uniqueVendors,
          recentVulns,
          weeklyChange: Math.round(weeklyChange * 100) / 100,
          monthlyChange: Math.round(monthlyChange * 100) / 100,
        });
      } catch (err) {
        console.error("Failed to fetch vulnerability metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculateMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
              <div className="h-6 bg-gray-200 rounded dark:bg-gray-700 w-16 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Total Vulnerabilities
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/20">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Vulnerabilities
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.totalVulnerabilities.toLocaleString()}
            </h4>
          </div>
          <Badge color={metrics.weeklyChange > 5 ? "error" : "warning"}>
            {metrics.weeklyChange > 5 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {metrics.weeklyChange}%
          </Badge>
        </div>
      </div> */}

      {/* High Severity Count */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
          <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              High Severity
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.highSeverityCount.toLocaleString()}
            </h4>
          </div>
          <Badge color="error">
            <ArrowUpIcon />
            {Math.round((metrics.highSeverityCount / metrics.totalVulnerabilities) * 100)}%
          </Badge>
        </div>
      </div>

      {/* Unique Vendors */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <GroupIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Affected Vendors
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.uniqueVendors.toLocaleString()}
            </h4>
          </div>
          <Badge color="warning">
            <ArrowUpIcon />
            {Math.round((metrics.uniqueVendors / metrics.totalVulnerabilities) * 100)}%
          </Badge>
        </div>
      </div>

      {/* Recent Vulnerabilities (Last 7 days)
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recent (7 days)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.recentVulns.toLocaleString()}
            </h4>
          </div>

          <Badge color={metrics.recentVulns > 10 ? "error" : "success"}>
            {metrics.recentVulns > 10 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.round((metrics.recentVulns / metrics.totalVulnerabilities) * 100)}%
          </Badge>
        </div>
      </div> */}
    </div>
  );
}
