// Service metadata for icons, descriptions, and colors
export interface ServiceMetadata {
  description: string;
  icon: string;
  color: string;
}

export const serviceMetadata: Record<string, ServiceMetadata> = {
  'OpenAI': {
    description: 'AI model APIs for production and research',
    icon: '🤖',
    color: '#10a37f'
  },
  'Stripe': {
    description: 'Payment processing APIs',
    icon: '💳',
    color: '#635bff'
  },
  'Google Cloud': {
    description: 'Cloud services and APIs',
    icon: '☁️',
    color: '#4285f4'
  },
  'AWS': {
    description: 'Amazon Web Services APIs',
    icon: '📦',
    color: '#ff9900'
  },
  'Discord': {
    description: 'Discord bot APIs',
    icon: '🎮',
    color: '#5865f2'
  },
  'Twilio': {
    description: 'Communication APIs',
    icon: '📞',
    color: '#f22f46'
  },
  'GitHub': {
    description: 'Git repository APIs',
    icon: '🐙',
    color: '#24292f'
  },
  'SendGrid': {
    description: 'Email delivery APIs',
    icon: '📧',
    color: '#1a82e2'
  },
  'Cloudinary': {
    description: 'Media management APIs',
    icon: '🖼️',
    color: '#3448c5'
  },
  'Firebase': {
    description: 'Backend platform APIs',
    icon: '🔥',
    color: '#ffca28'
  }
};

// Get metadata for a service, with fallback to default
export function getServiceMetadata(serviceName: string): ServiceMetadata {
  return serviceMetadata[serviceName] || {
    description: 'API Keys and credentials',
    icon: '🔑',
    color: '#6366f1'
  };
}

// Generate a color based on service name (for services not in metadata)
export function generateServiceColor(serviceName: string): string {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
    '#f43f5e', // rose
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
  ];
  
  // Generate a hash from the service name
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
