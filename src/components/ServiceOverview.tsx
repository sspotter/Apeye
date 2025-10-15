import { useNavigate } from 'react-router-dom';
import { type ApiKey } from '../lib/supabase';
import { getServiceMetadata } from '../lib/serviceMetadata';
import { Clock, Key, Plus } from 'lucide-react';

interface ServiceOverviewProps {
  apiKeys: ApiKey[];
}

interface ServiceStats {
  serviceName: string;
  keyCount: number;
  lastUpdated: string;
}

export function ServiceOverview({ apiKeys }: ServiceOverviewProps) {
  const navigate = useNavigate();

  // Group API keys by service
  const serviceStats: ServiceStats[] = Object.entries(
    apiKeys.reduce((acc, key) => {
      if (!acc[key.service_name]) {
        acc[key.service_name] = {
          count: 0,
          lastUpdated: key.updated_at
        };
      }
      acc[key.service_name].count++;
      
      // Keep track of the most recent update
      if (new Date(key.updated_at) > new Date(acc[key.service_name].lastUpdated)) {
        acc[key.service_name].lastUpdated = key.updated_at;
      }
      
      return acc;
    }, {} as Record<string, { count: number; lastUpdated: string }>)
  ).map(([serviceName, stats]) => ({
    serviceName,
    keyCount: stats.count,
    lastUpdated: stats.lastUpdated
  })).sort((a, b) => a.serviceName.localeCompare(b.serviceName));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleServiceClick = (serviceName: string) => {
    navigate(`/api-keys/${encodeURIComponent(serviceName)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold theme-text-primary">Services</h2>
        <p className="text-sm theme-text-tertiary">
          {serviceStats.length} {serviceStats.length === 1 ? 'service' : 'services'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {serviceStats.map((service) => {
          const metadata = getServiceMetadata(service.serviceName);
          
          return (
            <div
              key={service.serviceName}
              onClick={() => handleServiceClick(service.serviceName)}
              className="theme-bg-secondary theme-border border rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group"
              style={{
                borderLeft: `4px solid ${metadata.color}`
              }}
            >
              {/* Service Icon & Name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={service.serviceName}>
                    {metadata.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold theme-text-primary group-hover:text-blue-500 transition-colors truncate">
                      {service.serviceName}
                    </h3>
                    <p className="text-xs theme-text-tertiary mt-0.5 line-clamp-1">
                      {metadata.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 theme-text-tertiary" />
                  <span className="theme-text-secondary">
                    {service.keyCount} {service.keyCount === 1 ? 'key' : 'keys'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 theme-text-tertiary" />
                  <span className="theme-text-tertiary text-xs">
                    Updated {formatDate(service.lastUpdated)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t theme-border flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service.serviceName);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium theme-text-secondary hover:theme-text-primary hover:theme-bg-tertiary rounded-lg transition-colors"
                >
                  View All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open add modal with pre-selected service
                    handleServiceClick(service.serviceName);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {serviceStats.length === 0 && (
        <div className="text-center py-12 theme-bg-secondary theme-border border rounded-xl">
          <Key className="w-12 h-12 theme-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium theme-text-primary mb-2">
            No services yet
          </h3>
          <p className="theme-text-secondary">
            Add your first API key to get started
          </p>
        </div>
      )}
    </div>
  );
}
