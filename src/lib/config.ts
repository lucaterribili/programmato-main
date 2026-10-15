export type PortalTheme = "ostiaroma" | "porusski" | "cityrome" | "mondosapere" | "flagship" | "ai";

export type PortalDomain = {
  domain: string;
  label: string;
  theme: PortalTheme;
  tagline: string;
};

type OutletMeta = Omit<PortalDomain, "domain">;

// Anagrafica di tutte le testate conosciute (label/tema/tagline), a prescindere
// da quali siano effettivamente attive: l'elenco attivo viene da PORTAL_DOMAINS env.
const OUTLET_REGISTRY: Record<string, OutletMeta> = {
  lucaterribili: { label: "LucaTerribili", theme: "flagship", tagline: "Sviluppo e tecnologia" },
  "ai.programmato": { label: "Programmato AI", theme: "ai", tagline: "Assistente conversazionale e strumenti AI" },
  ostiaroma: { label: "OstiaRoma", theme: "ostiaroma", tagline: "Il litorale di Roma" },
  porusski: { label: "PoRusski", theme: "porusski", tagline: "Un ponte tra Italia e Russia" },
  cityrome: { label: "CityRome", theme: "cityrome", tagline: "La guida alla città" },
  mondosapere: { label: "MondoSapere", theme: "mondosapere", tagline: "Cultura e curiosità" },
};

// Normalizza "www.cityrome.it", "cityrome.it" e "cityrome.loc" (dev/prod) sulla stessa chiave.
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
