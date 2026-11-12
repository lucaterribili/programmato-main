import config from '@/lib/config';
import { backendFetch, buildQueryString, isDegradableError, isNotFoundError } from './http';
import type {
  NewsletterSubscription,
  NewsletterSubscriptionRequest,
  NewsletterSubscriptionResponse,
  NewsletterIssue,
  NewsletterArchiveResponse,
  NewsletterStats,
} from '@/lib/types';

interface BackendNewsletterSubscription {
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

interface BackendNewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    subscription: BackendNewsletterSubscription;
    requiresConfirmation: boolean;
  };
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

interface BackendNewsletterIssue {
  id: number;
  subject: string;
  preheader?: string;
  content: string;
  publishedAt?: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  sentAt?: string | null;
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    openRate: number;
    clickRate: number;
  };
}

interface BackendNewsletterArchiveResponse {
  issues: BackendNewsletterIssue[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

class NewsletterService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly domain: string;

  constructor() {
    this.baseUrl = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.domain = config.domain;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'domain': this.domain,
    };
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await backendFetch(url, {
      headers: {
        ...this.getHeaders(),
        ...options?.headers,
      },
      ...options,
    });
    return response.json();
  }

  private mapSubscription(backend: BackendNewsletterSubscription): NewsletterSubscription {
    return {
      email: backend.email,
      name: backend.name,
      source: backend.source,
      tags: backend.tags,
      consent: backend.consent,
      status: backend.status,
      subscribedAt: backend.subscribedAt,
      confirmedAt: backend.confirmedAt,
      unsubscribedAt: backend.unsubscribedAt,
      token: backend.token,
    };
  }

  private mapIssue(backend: BackendNewsletterIssue): NewsletterIssue {
    return {
      id: backend.id,
      subject: backend.subject,
      preheader: backend.preheader,
      content: backend.content,
      publishedAt: backend.publishedAt,
      status: backend.status,
      sentAt: backend.sentAt,
      stats: backend.stats ? {
        sent: backend.stats.sent,
        delivered: backend.stats.delivered,
        opened: backend.stats.opened,
        clicked: backend.stats.clicked,
        unsubscribed: backend.stats.unsubscribed,
        bounced: backend.stats.bounced,
        openRate: backend.stats.openRate,
        clickRate: backend.stats.clickRate,
      } : undefined,
    };
  }

  /**
   * Subscribe to newsletter.
   */
  async subscribe(data: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> {
    const endpoint = '/newsletter/subscribe';
    
    try {
      const response = await this.request<BackendNewsletterSubscriptionResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: response.success,
        message: response.message,
        data: response.data ? {
          subscription: this.mapSubscription(response.data.subscription),
          requiresConfirmation: response.data.requiresConfirmation,
        } : undefined,
        error: response.error,
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        return {
          success: false,
          message: 'Servizio newsletter non disponibile',
          error: { code: 'SERVICE_UNAVAILABLE', message: 'Servizio newsletter non disponibile' },
        };
      }
      console.error('Newsletter subscription error:', error);
      return {
        success: false,
        message: 'Errore durante l\'iscrizione. Riprova più tardi.',
        error: { code: 'INTERNAL_ERROR', message: 'Errore interno del server' },
      };
    }
  }

  /**
   * Confirm subscription via token.
   */
  async confirmSubscription(token: string): Promise<NewsletterSubscriptionResponse> {
    const endpoint = `/newsletter/confirm${buildQueryString({ token })}`;
    
    try {
      const response = await this.request<BackendNewsletterSubscriptionResponse>(endpoint, {
        method: 'POST',
      });

      return {
        success: response.success,
        message: response.message,
        data: response.data ? {
          subscription: this.mapSubscription(response.data.subscription),
          requiresConfirmation: response.data.requiresConfirmation,
        } : undefined,
        error: response.error,
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        return {
          success: false,
          message: 'Token di conferma non valido o scaduto',
          error: { code: 'INVALID_TOKEN', message: 'Token di conferma non valido o scaduto' },
        };
      }
      return {
        success: false,
        message: 'Errore durante la conferma. Riprova più tardi.',
        error: { code: 'INTERNAL_ERROR', message: 'Errore interno del server' },
      };
    }
  }

  /**
   * Unsubscribe from newsletter.
   */
  async unsubscribe(email: string, token?: string): Promise<NewsletterSubscriptionResponse> {
    const endpoint = `/newsletter/unsubscribe${buildQueryString({ email, token })}`;
    
    try {
      const response = await this.request<BackendNewsletterSubscriptionResponse>(endpoint, {
        method: 'POST',
      });

      return {
        success: response.success,
        message: response.message,
        data: response.data ? {
          subscription: this.mapSubscription(response.data.subscription),
          requiresConfirmation: response.data.requiresConfirmation,
        } : undefined,
        error: response.error,
      };
    } catch (error) {
      if (isNotFoundError(error)) {
        return {
          success: false,
          message: 'Iscrizione non trovata',
          error: { code: 'NOT_FOUND', message: 'Iscrizione non trovata' },
        };
      }
      return {
        success: false,
        message: 'Errore durante la disiscrizione. Riprova più tardi.',
        error: { code: 'INTERNAL_ERROR', message: 'Errore interno del server' },
      };
    }
  }

  /**
   * Get newsletter archive (sent issues).
   */
  async getArchive(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<NewsletterArchiveResponse> {
    const query = buildQueryString({ pageNumber, pageSize });
    const endpoint = `/newsletter/archive${query}`;
    
    try {
      const response = await this.request<BackendNewsletterArchiveResponse>(endpoint);
      
      return {
        issues: response.issues.map(issue => this.mapIssue(issue)),
        pagination: {
          pageNumber: response.pageable.pageNumber,
          pageSize: response.pageable.pageSize,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        },
      };
    } catch (error) {
      if (isDegradableError(error)) {
        return {
          issues: [],
          pagination: {
            pageNumber: 1,
            pageSize,
            totalPages: 0,
            totalElements: 0,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get newsletter issue by ID.
   */
  async getIssueById(id: number): Promise<NewsletterIssue | null> {
    try {
      const response = await this.request<{ issue: BackendNewsletterIssue }>(`/newsletter/${id}`);
      return this.mapIssue(response.issue);
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }

  /**
   * Get newsletter stats (for dashboard).
   */
  async getStats(): Promise<NewsletterStats | null> {
    try {
      const response = await this.request<{ stats: NewsletterStats }>(`/newsletter/stats`);
      return response.stats;
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }
}

const newsletterService = new NewsletterService();
export default newsletterService;