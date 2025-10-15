import { useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ServiceContext {
  serviceName?: string;
  category?: string;
  apiCount?: number;
  notes?: string;
  currentPage: string;
}

export function useServiceContext(): ServiceContext {
  const location = useLocation();
  const { serviceName } = useParams<{ serviceName: string }>();
  const [context, setContext] = useState<ServiceContext>({
    currentPage: location.pathname
  });

  useEffect(() => {
    async function fetchContext() {
      if (serviceName) {
        const decodedServiceName = decodeURIComponent(serviceName);
        
        try {
          // Get user
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Fetch API keys for this service
          const { data: apiKeys, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', user.id)
            .eq('service_name', decodedServiceName);

          if (error) {
            console.error('Error fetching service context:', error);
            return;
          }

          // Try to fetch service notes
          const { data: serviceNotes } = await supabase
            .from('service_notes')
            .select('markdown_content')
            .eq('user_id', user.id)
            .eq('service_name', decodedServiceName)
            .single();

          setContext({
            serviceName: decodedServiceName,
            apiCount: apiKeys?.length || 0,
            notes: serviceNotes?.markdown_content || '',
            currentPage: location.pathname
          });
        } catch (error) {
          console.error('Error in fetchContext:', error);
        }
      } else {
        // No service name - general context
        setContext({
          currentPage: location.pathname
        });
      }
    }

    fetchContext();
  }, [serviceName, location.pathname]);

  return context;
}
