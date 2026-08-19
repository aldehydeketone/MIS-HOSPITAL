export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
