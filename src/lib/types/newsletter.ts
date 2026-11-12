export interface NewsletterSubscription {
  email: string;
  name?: string;
  source?: string;
  tags?: string[];
  consent: boolean;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  subscribedAt: string;
  confirmedAt?: string | null;
  unsubscribedAt?: string | null;
  token?: string;
}

export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
  source?: string;
  tags?: string[];
  consent: boolean;
  honeypot?: string;
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    subscription: NewsletterSubscription;
    requiresConfirmation: boolean;
  };
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface NewsletterIssue {
  id: number;
  subject: string;
  preheader?: string;
  content: string;
  publishedAt?: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: string | null;
  stats?: NewsletterStats;
}

export interface NewsletterStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
}

export interface NewsletterArchiveResponse {
  issues: NewsletterIssue[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}