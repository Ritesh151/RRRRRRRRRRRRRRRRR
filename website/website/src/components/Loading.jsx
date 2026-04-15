export default function Loading({ size = 'medium', text = 'Loading...' }) {
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-16 w-16'
  }
  
  const spinnerSizes = {
    small: 'border-2',
    medium: 'border-2',
    large: 'border-3'
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizes[size]} rounded-full animate-spin border-b-2 border-primary`}></div>
      {text && <p className="mt-4 text-gray-500">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-12 w-12 rounded-full animate-spin border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export function InlineLoading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className="h-5 w-5 rounded-full animate-spin border-b-2 border-primary"></div>
      <span className="text-gray-500 text-sm">{text}</span>
    </div>
  )
}