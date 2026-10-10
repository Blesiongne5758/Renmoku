import { motion } from 'framer-motion';

export default function RevenueChart() {
  const data = [40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-luxury p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">📈 Grafik Pendapatan</h3>
        <div className="flex gap-2">
          {['Harian', 'Mingguan', 'Bulan'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                period === 'Bulan'
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-2">
        {data.map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="flex-1 bg-gradient-to-t from-gold-600 to-gold-400 rounded-t-lg hover:opacity-80 cursor-pointer relative group"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-gold-400 whitespace-nowrap bg-bg-secondary px-2 py-1 rounded">
                Rp {height * 500}k
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {months.map((month) => (
          <span key={month} className="text-[10px] text-gray-600 flex-1 text-center">
            {month}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
