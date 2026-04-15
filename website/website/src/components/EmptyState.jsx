export default function EmptyState({ 
  icon, 
  title, 
  message, 
  actionText, 
  onAction 
}) {
  return (
    <div className="bg-white rounded-xl p-12 shadow-card text-center">
      {icon && (
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-4">{message}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}