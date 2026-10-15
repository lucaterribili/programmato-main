import { PORTAL_DOMAINS } from "@/lib/config";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} Programmato — Tutti i diritti riservati</span>
        <span className="footer-outlets">
          {PORTAL_DOMAINS.map((outlet) => outlet.label).join(" · ")}
        </span>
      </div>
    </footer>
  );
}
