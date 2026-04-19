export default function Card({ title, value, color }) {
  return (
    <div className="bg-card p-5 rounded-xl shadow">
      <h2 className="text-sm text-gray-400">{title}</h2>
      <p className={`text-2xl font-bold ${color}`}>
        {value || 0}
      </p>
    </div>
  );
}