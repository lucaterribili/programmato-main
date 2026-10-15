import Link from "next/link";

export function Header() {
  return (
    <header className="masthead">
      <div className="container masthead-inner">
        <Link href="/" className="masthead-brand">
          <span className="masthead-kicker">La rete editoriale</span>
          <span className="masthead-logo">
            programm<span>ato</span>
          </span>
        </Link>
        <nav className="masthead-nav">
          <a href="#ultimi-contenuti">Ultimi contenuti</a>
          <a href="#testate">Testate</a>
          <a href="#chi-siamo">Chi siamo</a>
        </nav>
      </div>
    </header>
  );
}
