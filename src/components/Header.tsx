interface HeaderProps {
  coupleName: string;
  weddingMessage?: string | null;
}

export function Header({ coupleName, weddingMessage }: HeaderProps) {
  return (
    <header className="site-header">
      <p className="site-header__ornament" aria-hidden="true">♥</p>
      <h1 className="site-header__couple">{coupleName}</h1>
      <div className="site-header__divider" aria-hidden="true" />
      {weddingMessage && (
        <p className="site-header__message">{weddingMessage}</p>
      )}
    </header>
  );
}
