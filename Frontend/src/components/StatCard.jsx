export default function StatCard({ title, subtitle, value, footer }) {
  return (
    <div className="relative rounded-3xl p-6 h-48 glass-card overflow-hidden hover-lift">
      {/* Soft gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-dark-400 mt-1">{subtitle}</p>
        </div>

        <div className="text-4xl font-bold text-white">{value}</div>

        <div className="text-xs text-dark-400">{footer}</div>
      </div>
    </div>
  );
}
