export default function ServiceCard({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-center">{desc}</p>
    </div>
  );
} 