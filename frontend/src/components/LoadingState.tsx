type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
