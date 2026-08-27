interface LoadingProps {
  fullscreen?: boolean;
}

export function Loading({ fullscreen = false }: LoadingProps) {
  if (fullscreen) {
    return (
      <div className="loading-fullscreen" aria-label="Carregando...">
        <div className="spinner" role="status" />
      </div>
    );
  }
  return <div className="spinner" role="status" aria-label="Carregando..." />;
}
