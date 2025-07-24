export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="닫기"
        >×</button>
        {children}
      </div>
    </div>
  );
} 