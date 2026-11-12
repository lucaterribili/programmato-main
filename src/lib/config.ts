interface Config {
  apiEndpoint: string;
  apiKey: string;
  domain: string;
  mediaBaseUrl: string;
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  supportedLocales: string[];
  revalidateSeconds: number;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Merge old config and new config structure
const config: Config = {
  apiEndpoint: process.env.NEXT_PUBLIC_ENDPOINT ?? process.env.REST_API_URL ?? 'http://localhost:8080',
  apiKey: process.env.NEXT_PUBLIC_API_KEY ?? '',
  domain: process.env.NEXT_PUBLIC_DOMAIN ?? 'programmato.it',
  mediaBaseUrl: process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? 'https://fridaymedia.s3.eu-west-par.io.cloud.ovh.net',
  siteName: 'Programmato',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://programmato.it',
  defaultLocale: 'it',
  supportedLocales: ['it'],
  revalidateSeconds: 300,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

export default config;

export type PortalTheme = "ostiaroma" | "porusski" | "cityrome" | "mondosapere" | "flagship" | "ai";

export type PortalDomain = {
  domain: string;
  label: string;
  theme: PortalTheme;
  tagline: string;
};

const OUTLET_REGISTRY: Record<string, Omit<PortalDomain, "domain">> = {
  lucaterribili: { label: "LucaTerribili", theme: "flagship", tagline: "Sviluppo e tecnologia" },
  "ai.programmato": { label: "Programmato AI", theme: "ai", tagline: "Assistente conversazionale e strumenti AI" },
  ostiaroma: { label: "OstiaRoma", theme: "ostiaroma", tagline: "Il litorale di Roma" },
  porusski: { label: "PoRusski", theme: "porusski", tagline: "Un ponte tra Italia e Russia" },
  cityrome: { label: "CityRome", theme: "cityrome", tagline: "La guida alla città" },
  mondosapere: { label: "MondoSapere", theme: "mondosapere", tagline: "Cultura e curiosità" },
};

function registryKey(domain: string): string {
  return domain
    .replace(/^www\./, "")
    .replace(/^test\./, "")
    .replace(/\.(it|loc|com|org)$/, "");
}

function parseEnvDomains(): string[] {
  return (process.env.PORTAL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
}

export const PORTAL_DOMAIN_NAMES = parseEnvDomains();

export const PORTAL_DOMAINS: PortalDomain[] = PORTAL_DOMAIN_NAMES.map((domain) => {
  const meta = OUTLET_REGISTRY[registryKey(domain)];
  return {
    domain,
    label: meta?.label ?? domain,
    theme: meta?.theme ?? "flagship",
    tagline: meta?.tagline ?? "",
  };
});

export function getPortalDomain(domainName: string | undefined): PortalDomain | undefined {
  if (!domainName) return undefined;
  const meta = OUTLET_REGISTRY[registryKey(domainName)];
  if (!meta) return undefined;
  return { domain: domainName, ...meta };
}