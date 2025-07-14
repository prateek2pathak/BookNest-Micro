import React, { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ServiceStatus({ isInNavbar = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const checkServices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/status`);
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to check service status:", error);
      setStatus({ error: "Failed to connect to API Gateway" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (!isExpanded) {
      checkServices(); // Refresh when opening
    }
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (isHealthy) => {
    return isHealthy ? "text-green-400" : "text-red-400";
  };

  // Navbar version (compact)
  if (isInNavbar) {
    const overallHealthy = status?.overall === "healthy";

    return (
      <div className="relative">
        <button
          onClick={handleClick}
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
          title="Service Status"
        >
          {loading ? (
            <div className="animate-spin h-3 w-3 border border-orange-500 border-t-transparent rounded-full"></div>
          ) : (
            <span
              className={
                status?.error
                  ? "text-red-400"
                  : getStatusColor(overallHealthy)
              }
            >
              ●
            </span>
          )}
          <span className="text-xs font-medium">Services</span>
          <span className="text-xs">{isExpanded ? "▼" : "▶"}</span>
        </button>

        {/* Dropdown */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-3 min-w-48 z-50">
            <div className="text-sm font-semibold text-orange-400 mb-2">
              Services
            </div>

            {status?.error ? (
              <div className="text-red-400 text-xs">{status.error}</div>
            ) : (
              <div className="space-y-1">
                {status?.services &&
                  Object.entries(status.services).map(([name, service]) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className={getStatusColor(service.healthy)}>●</span>
                      <span className="text-xs capitalize">{name}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="fixed top-4 right-4 bg-zinc-800 text-white p-4 rounded-lg shadow-lg border border-zinc-700">
      <div className="text-sm font-semibold mb-2">Service Status</div>

      {status?.error ? (
        <div className="text-red-400 text-sm">{status.error}</div>
      ) : (
        <div className="space-y-1">
          {status?.services &&
            Object.entries(status.services).map(([name, service]) => (
              <div key={name} className="flex items-center gap-2">
                <span className={getStatusColor(service.healthy)}>●</span>
                <span className="text-xs capitalize">{name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
