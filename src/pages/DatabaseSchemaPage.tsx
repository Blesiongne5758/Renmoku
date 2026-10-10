import { motion } from 'framer-motion';
import { Database, Table, Key, Link2, Hash, FileText, Calendar, CreditCard, Shield, Star, Wrench, Bell, Settings, MapPin, Tag } from 'lucide-react';

interface TableSchema {
  name: string;
  description: string;
  icon: any;
  color: string;
  columns: {
    name: string;
    type: string;
    isPK?: boolean;
    isFK?: boolean;
    isRequired?: boolean;
    description?: string;
  }[];
  relations?: { table: string; type: string }[];
}

const schemas: TableSchema[] = [
  {
    name: 'users',
    description: 'Tabel utama pengguna platform',
    icon: Table,
    color: 'from-blue-500 to-blue-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true, description: 'Primary key' },
      { name: 'email', type: 'VARCHAR(255)', isRequired: true, description: 'Email unik' },
      { name: 'password_hash', type: 'VARCHAR(255)', isRequired: true, description: 'Hash password bcrypt' },
      { name: 'phone', type: 'VARCHAR(20)', description: 'No. telepon' },
      { name: 'role', type: 'ENUM', isRequired: true, description: 'INDIVIDUAL|CORPORATE|OWNER|ADMIN|DRIVER' },
      { name: 'email_verified', type: 'BOOLEAN', description: 'Status verifikasi email' },
      { name: 'is_active', type: 'BOOLEAN', description: 'Status akun aktif' },
      { name: 'last_login_at', type: 'TIMESTAMP', description: 'Waktu login terakhir' },
      { name: 'created_at', type: 'TIMESTAMP', description: 'Waktu pendaftaran' },
    ],
    relations: [
      { table: 'individual_profiles', type: '1:1' },
      { table: 'corporate_profiles', type: '1:1' },
      { table: 'owner_profiles', type: '1:1' },
      { table: 'bookings', type: '1:N' },
    ],
  },
  {
    name: 'vehicles',
    description: 'Data kendaraan dalam armada',
    icon: Table,
    color: 'from-gold-500 to-gold-700',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'owner_id', type: 'UUID', isFK: true, isRequired: true, description: '→ owner_profiles.id' },
      { name: 'name', type: 'VARCHAR(100)', isRequired: true, description: 'Nama kendaraan' },
      { name: 'brand', type: 'VARCHAR(50)', isRequired: true, description: 'Merek' },
      { name: 'year', type: 'INT', isRequired: true, description: 'Tahun produksi' },
      { name: 'type', type: 'ENUM', isRequired: true, description: 'SEDAN|SUV|MPV|LUXURY|SPORT' },
      { name: 'transmission', type: 'ENUM', description: 'AUTOMATIC|MANUAL|CVT' },
      { name: 'plate_number', type: 'VARCHAR(15)', isRequired: true, description: 'Nomor polisi (unik)' },
      { name: 'price_per_day', type: 'DECIMAL(12,2)', isRequired: true, description: 'Harga sewa/hari' },
      { name: 'price_per_week', type: 'DECIMAL(12,2)', description: 'Harga sewa/minggu' },
      { name: 'price_per_month', type: 'DECIMAL(12,2)', description: 'Harga sewa/bulan' },
      { name: 'location', type: 'VARCHAR(100)', description: 'Kota lokasi' },
      { name: 'status', type: 'ENUM', description: 'AVAILABLE|RENTED|MAINTENANCE' },
      { name: 'images', type: 'TEXT[]', description: 'Array URL gambar' },
      { name: 'features', type: 'TEXT[]', description: 'Fitur kendaraan' },
      { name: 'rating', type: 'DECIMAL(3,2)', description: 'Rating rata-rata' },
    ],
    relations: [
      { table: 'owner_profiles', type: 'N:1' },
      { table: 'bookings', type: '1:N' },
      { table: 'reviews', type: '1:N' },
      { table: 'vehicle_inspections', type: '1:N' },
    ],
  },
  {
    name: 'bookings',
    description: 'Data pemesanan kendaraan',
    icon: Calendar,
    color: 'from-emerald-500 to-emerald-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'booking_number', type: 'VARCHAR(20)', isRequired: true, description: 'BK-YYYYMMDD-XXXX' },
      { name: 'renter_id', type: 'UUID', isFK: true, isRequired: true, description: '→ users.id' },
      { name: 'owner_id', type: 'UUID', isFK: true, isRequired: true, description: '→ users.id' },
      { name: 'vehicle_id', type: 'UUID', isFK: true, isRequired: true, description: '→ vehicles.id' },
      { name: 'driver_id', type: 'UUID', isFK: true, description: '→ driver_profiles.id (nullable)' },
      { name: 'rental_type', type: 'ENUM', isRequired: true, description: 'WITH_DRIVER|SELF_DRIVE' },
      { name: 'start_date', type: 'TIMESTAMP', isRequired: true },
      { name: 'end_date', type: 'TIMESTAMP', isRequired: true },
      { name: 'duration', type: 'INT', description: 'Durasi dalam hari' },
      { name: 'pickup_location', type: 'VARCHAR(255)', isRequired: true },
      { name: 'dropoff_location', type: 'VARCHAR(255)', isRequired: true },
      { name: 'total_price', type: 'DECIMAL(12,2)', isRequired: true },
      { name: 'dp_amount', type: 'DECIMAL(12,2)', description: 'Uang muka 30-50%' },
      { name: 'payment_status', type: 'ENUM', description: 'UNPAID|DP_PAID|FULLY_PAID' },
      { name: 'status', type: 'ENUM', description: 'DRAFT|PENDING|CONFIRMED|ACTIVE|COMPLETED' },
    ],
    relations: [
      { table: 'users (renter)', type: 'N:1' },
      { table: 'users (owner)', type: 'N:1' },
      { table: 'vehicles', type: 'N:1' },
      { table: 'payments', type: '1:N' },
      { table: 'contracts', type: '1:1' },
      { table: 'vehicle_inspections', type: '1:N' },
    ],
  },
  {
    name: 'payments',
    description: 'Transaksi pembayaran DP & pelunasan',
    icon: CreditCard,
    color: 'from-purple-500 to-purple-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'payment_number', type: 'VARCHAR(20)', isRequired: true, description: 'PAY-YYYYMMDD-XXXX' },
      { name: 'booking_id', type: 'UUID', isFK: true, isRequired: true, description: '→ bookings.id' },
      { name: 'user_id', type: 'UUID', isFK: true, isRequired: true, description: '→ users.id' },
      { name: 'type', type: 'VARCHAR(20)', isRequired: true, description: '"dp" | "remaining" | "full"' },
      { name: 'amount', type: 'DECIMAL(12,2)', isRequired: true },
      { name: 'method', type: 'ENUM', description: 'BANK_TRANSFER|VA|E_WALLET|QRIS' },
      { name: 'status', type: 'ENUM', description: 'UNPAID|DP_PAID|FULLY_PAID|REFUNDED' },
      { name: 'transaction_id', type: 'VARCHAR(100)', description: 'ID payment gateway' },
      { name: 'va_number', type: 'VARCHAR(50)', description: 'Virtual account number' },
      { name: 'paid_at', type: 'TIMESTAMP', description: 'Waktu pembayaran' },
      { name: 'due_at', type: 'TIMESTAMP', isRequired: true, description: 'Batas waktu bayar' },
    ],
    relations: [
      { table: 'bookings', type: 'N:1' },
      { table: 'users', type: 'N:1' },
    ],
  },
  {
    name: 'individual_profiles',
    description: 'Profil penyewa pribadi — KTP, SIM A, KK',
    icon: Shield,
    color: 'from-cyan-500 to-cyan-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'user_id', type: 'UUID', isFK: true, isRequired: true, description: '→ users.id (unique)' },
      { name: 'full_name', type: 'VARCHAR(100)', isRequired: true },
      { name: 'nik', type: 'VARCHAR(16)', isRequired: true, description: 'No. KTP 16 digit (unique)' },
      { name: 'birth_date', type: 'DATE' },
      { name: 'address', type: 'TEXT' },
      { name: 'sim_number', type: 'VARCHAR(20)', description: 'No. SIM A' },
      { name: 'sim_expiry', type: 'DATE', description: 'Masa berlaku SIM' },
      { name: 'emergency_name', type: 'VARCHAR(100)', description: 'Kontak darurat' },
      { name: 'emergency_phone', type: 'VARCHAR(20)' },
      { name: 'is_verified', type: 'BOOLEAN', description: 'Status verifikasi' },
    ],
    relations: [{ table: 'users', type: '1:1' }],
  },
  {
    name: 'corporate_profiles',
    description: 'Profil penyewa perusahaan — NIB, Akta, NPWP, PIC',
    icon: Shield,
    color: 'from-orange-500 to-orange-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'user_id', type: 'UUID', isFK: true, isRequired: true, description: '→ users.id (unique)' },
      { name: 'company_name', type: 'VARCHAR(200)', isRequired: true },
      { name: 'nib', type: 'VARCHAR(20)', isRequired: true, description: 'Nomor Induk Berusaha (unique)' },
      { name: 'npwp', type: 'VARCHAR(20)', isRequired: true, description: 'NPWP Perusahaan (unique)' },
      { name: 'akta_number', type: 'VARCHAR(50)', description: 'No. Akta Pendirian' },
      { name: 'company_address', type: 'TEXT' },
      { name: 'pic_name', type: 'VARCHAR(100)', isRequired: true, description: 'Person In Charge' },
      { name: 'pic_position', type: 'VARCHAR(50)', description: 'Jabatan PIC' },
      { name: 'pic_phone', type: 'VARCHAR(20)' },
      { name: 'credit_limit', type: 'DECIMAL(15,2)', description: 'Limit kredit corporate' },
      { name: 'is_verified', type: 'BOOLEAN' },
    ],
    relations: [{ table: 'users', type: '1:1' }],
  },
  {
    name: 'contracts',
    description: 'E-Contract digital dengan S&K per tipe user',
    icon: FileText,
    color: 'from-rose-500 to-rose-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'contract_number', type: 'VARCHAR(20)', isRequired: true, description: 'CTR-YYYYMMDD-XXXX' },
      { name: 'booking_id', type: 'UUID', isFK: true, isRequired: true, description: '→ bookings.id (unique)' },
      { name: 'renter_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'owner_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'title', type: 'VARCHAR(200)', isRequired: true },
      { name: 'content', type: 'TEXT', description: 'Isi kontrak' },
      { name: 'terms_and_conditions', type: 'TEXT', description: 'S&K spesifik per tipe user' },
      { name: 'renter_signed_at', type: 'TIMESTAMP', description: 'Waktu tanda tangan penyewa' },
      { name: 'renter_signature', type: 'TEXT', description: 'Base64 tanda tangan' },
      { name: 'owner_signed_at', type: 'TIMESTAMP' },
      { name: 'status', type: 'ENUM', description: 'DRAFT|SENT|SIGNED|FULLY_SIGNED' },
      { name: 'pdf_url', type: 'VARCHAR(500)', description: 'URL PDF final' },
    ],
    relations: [
      { table: 'bookings', type: '1:1' },
      { table: 'users (renter)', type: 'N:1' },
      { table: 'users (owner)', type: 'N:1' },
    ],
  },
  {
    name: 'vehicle_inspections',
    description: 'Check-in/Check-out digital dengan foto kondisi',
    icon: Shield,
    color: 'from-teal-500 to-teal-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'booking_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'vehicle_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'type', type: 'ENUM', isRequired: true, description: 'CHECK_IN|CHECK_OUT' },
      { name: 'fuel_level', type: 'INT', description: 'Level BBM 0-100%' },
      { name: 'odometer_reading', type: 'DECIMAL(10,2)', description: 'KM saat inspeksi' },
      { name: 'exterior_photos', type: 'TEXT[]', description: 'Foto kondisi luar' },
      { name: 'interior_photos', type: 'TEXT[]', description: 'Foto kondisi dalam' },
      { name: 'has_damage', type: 'BOOLEAN', description: 'Ada kerusakan?' },
      { name: 'damage_photos', type: 'TEXT[]', description: 'Foto kerusakan' },
      { name: 'damage_level', type: 'ENUM', description: 'NONE|MINOR|MODERATE|MAJOR' },
      { name: 'equipment_check', type: 'JSONB', description: 'Checklist perlengkapan' },
      { name: 'inspected_by', type: 'UUID', description: 'ID inspector' },
      { name: 'renter_signature', type: 'TEXT' },
      { name: 'owner_signature', type: 'TEXT' },
    ],
    relations: [
      { table: 'bookings', type: 'N:1' },
      { table: 'vehicles', type: 'N:1' },
    ],
  },
  {
    name: 'reviews',
    description: 'Rating dan review dari penyewa',
    icon: Star,
    color: 'from-yellow-500 to-yellow-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'booking_id', type: 'UUID', isFK: true, isRequired: true, description: '1 booking = 1 review' },
      { name: 'renter_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'vehicle_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'overall_rating', type: 'INT', isRequired: true, description: '1-5 stars' },
      { name: 'vehicle_rating', type: 'INT', description: 'Rating kondisi kendaraan' },
      { name: 'service_rating', type: 'INT', description: 'Rating pelayanan' },
      { name: 'value_rating', type: 'INT', description: 'Rating value for money' },
      { name: 'title', type: 'VARCHAR(200)' },
      { name: 'comment', type: 'TEXT' },
      { name: 'photos', type: 'TEXT[]' },
      { name: 'owner_reply', type: 'TEXT', description: 'Balasan dari pemilik' },
    ],
    relations: [
      { table: 'bookings', type: '1:1' },
      { table: 'vehicles', type: 'N:1' },
      { table: 'users', type: 'N:1' },
    ],
  },
  {
    name: 'documents',
    description: 'Upload dokumen persyaratan penyewa',
    icon: FileText,
    color: 'from-indigo-500 to-indigo-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'user_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'type', type: 'VARCHAR(30)', isRequired: true, description: 'ktp|sim|kk|npwp|nib|akta|guarantee_letter|jaminan' },
      { name: 'title', type: 'VARCHAR(100)', isRequired: true },
      { name: 'file_url', type: 'VARCHAR(500)', isRequired: true, description: 'URL di cloud storage' },
      { name: 'file_type', type: 'VARCHAR(50)', description: 'MIME type' },
      { name: 'file_size', type: 'INT', description: 'Ukuran file (bytes)' },
      { name: 'status', type: 'VARCHAR(20)', description: 'pending|verified|rejected' },
      { name: 'verified_by', type: 'UUID', description: 'Admin yang verifikasi' },
      { name: 'reject_reason', type: 'TEXT' },
      { name: 'expiry_date', type: 'DATE', description: 'Tanggal kadaluarsa' },
    ],
    relations: [{ table: 'users', type: 'N:1' }],
  },
  {
    name: 'notifications',
    description: 'Notifikasi real-time untuk pengguna',
    icon: Bell,
    color: 'from-pink-500 to-pink-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'user_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'type', type: 'ENUM', description: 'BOOKING_CONFIRMED|PAYMENT_RECEIVED|...' },
      { name: 'title', type: 'VARCHAR(200)', isRequired: true },
      { name: 'message', type: 'TEXT', isRequired: true },
      { name: 'data', type: 'JSONB', description: 'Payload tambahan' },
      { name: 'is_read', type: 'BOOLEAN', description: 'Sudah dibaca?' },
      { name: 'action_url', type: 'VARCHAR(500)', description: 'Deep link untuk aksi' },
    ],
    relations: [{ table: 'users', type: 'N:1' }],
  },
  {
    name: 'maintenance_logs',
    description: 'Log perawatan & servis kendaraan',
    icon: Wrench,
    color: 'from-amber-500 to-amber-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'vehicle_id', type: 'UUID', isFK: true, isRequired: true },
      { name: 'type', type: 'VARCHAR(30)', description: 'oil_change|tire|brake|general|accident' },
      { name: 'title', type: 'VARCHAR(200)', isRequired: true },
      { name: 'description', type: 'TEXT' },
      { name: 'cost', type: 'DECIMAL(12,2)', description: 'Biaya servis' },
      { name: 'mileage_at_service', type: 'DECIMAL(10,2)', description: 'KM saat servis' },
      { name: 'service_date', type: 'DATE', isRequired: true },
      { name: 'next_service_date', type: 'DATE' },
      { name: 'workshop', type: 'VARCHAR(200)', description: 'Nama bengkel' },
      { name: 'invoice_url', type: 'VARCHAR(500)' },
    ],
    relations: [{ table: 'vehicles', type: 'N:1' }],
  },
  {
    name: 'promotions',
    description: 'Kode promo & diskon',
    icon: Tag,
    color: 'from-lime-500 to-lime-600',
    columns: [
      { name: 'id', type: 'UUID', isPK: true },
      { name: 'code', type: 'VARCHAR(20)', isRequired: true, description: 'HEMAT20, NEWUSER, etc.' },
      { name: 'title', type: 'VARCHAR(100)', isRequired: true },
      { name: 'discount_type', type: 'VARCHAR(20)', description: 'percentage|fixed' },
      { name: 'discount_value', type: 'DECIMAL(10,2)', isRequired: true },
      { name: 'min_booking', type: 'DECIMAL(12,2)', description: 'Minimum total booking' },
      { name: 'max_discount', type: 'DECIMAL(12,2)', description: 'Maksimum potongan' },
      { name: 'usage_limit', type: 'INT', description: 'Total penggunaan' },
      { name: 'used_count', type: 'INT', description: 'Sudah digunakan' },
      { name: 'start_date', type: 'TIMESTAMP', isRequired: true },
      { name: 'end_date', type: 'TIMESTAMP', isRequired: true },
      { name: 'applicable_roles', type: 'ENUM[]', description: 'Role yang bisa pakai' },
    ],
    relations: [],
  },
];

export default function DatabaseSchemaPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-gold-500/20 mb-4">
            <Database className="w-4 h-4 text-gold-400" />
            <span className="text-xs text-gold-300 font-medium tracking-wide">POSTGRESQL + PRISMA ORM</span>
          </div>
          <h1 className="font-[Playfair_Display] text-3xl sm:text-5xl font-bold text-white mb-4">
            Database <span className="text-gold-gradient">Schema</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Struktur database relational untuk platform Renmoku. 15 tabel utama dengan relasi
            yang mendukung multi-role users, fleet management, booking, payment, dan e-contract.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: 'Total Tabel', value: '15' },
            { label: 'Relasi', value: '30+' },
            { label: 'Enums', value: '12' },
            { label: 'Index', value: '40+' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center border border-white/5">
              <p className="text-gold-gradient font-bold text-2xl">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ERD Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-gold-500/10 mb-12"
        >
          <h2 className="font-[Playfair_Display] text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-gold-400" />
            Entity Relationship Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { from: 'users', to: 'individual_profiles', label: '1:1 (Pribadi)' },
              { from: 'users', to: 'corporate_profiles', label: '1:1 (Corporate)' },
              { from: 'users', to: 'owner_profiles', label: '1:1 (Pemilik)' },
              { from: 'owner_profiles', to: 'vehicles', label: '1:N (Armada)' },
              { from: 'vehicles', to: 'bookings', label: '1:N (Pemesanan)' },
              { from: 'bookings', to: 'payments', label: '1:N (Pembayaran)' },
              { from: 'bookings', to: 'contracts', label: '1:1 (E-Contract)' },
              { from: 'bookings', to: 'vehicle_inspections', label: '1:N (Inspeksi)' },
              { from: 'bookings', to: 'reviews', label: '1:1 (Review)' },
              { from: 'users', to: 'documents', label: '1:N (Dokumen)' },
              { from: 'users', to: 'notifications', label: '1:N (Notifikasi)' },
              { from: 'vehicles', to: 'maintenance_logs', label: '1:N (Servis)' },
            ].map((rel, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-xs text-gold-400 font-mono">{rel.from}</span>
                <span className="text-xs text-gray-600">→</span>
                <span className="text-xs text-emerald-400 font-mono">{rel.to}</span>
                <span className="text-[10px] text-gray-600 ml-auto">{rel.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Table Schemas */}
        <div className="space-y-6">
          {schemas.map((schema, i) => (
            <motion.div
              key={schema.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="glass rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/10 transition-all"
            >
              {/* Table Header */}
              <div className={`p-4 sm:p-5 bg-gradient-to-r ${schema.color} bg-opacity-10 border-b border-white/5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <schema.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold font-mono text-sm sm:text-base">{schema.name}</h3>
                      <p className="text-white/60 text-xs">{schema.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-[10px] bg-white/10 text-white/80">
                      {schema.columns.length} kolom
                    </span>
                    {schema.relations && (
                      <span className="px-2 py-1 rounded text-[10px] bg-white/10 text-white/80">
                        {schema.relations.length} relasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Columns */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Kolom</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium">Tipe</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium hidden sm:table-cell">Constraint</th>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-medium hidden md:table-cell">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.columns.map((col, j) => (
                      <tr key={j} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            {col.isPK && <Key className="w-3 h-3 text-gold-400" />}
                            {col.isFK && <Link2 className="w-3 h-3 text-blue-400" />}
                            <span className={`font-mono text-xs ${col.isPK ? 'text-gold-300' : col.isFK ? 'text-blue-300' : 'text-gray-300'}`}>
                              {col.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-purple-300 font-mono">{col.type}</span>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <div className="flex gap-1">
                            {col.isPK && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gold-500/10 text-gold-400 border border-gold-500/20">PK</span>
                            )}
                            {col.isFK && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">FK</span>
                            )}
                            {col.isRequired && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">NOT NULL</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className="text-xs text-gray-500">{col.description || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Relations */}
              {schema.relations && schema.relations.length > 0 && (
                <div className="p-4 border-t border-white/5 bg-white/[0.01]">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Relasi:</p>
                  <div className="flex flex-wrap gap-2">
                    {schema.relations.map((rel, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/[0.03] border border-white/5">
                        <Link2 className="w-3 h-3 text-gold-400/60" />
                        <span className="text-gray-400 font-mono">{rel.table}</span>
                        <span className="text-gold-400/60">({rel.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Business Logic Notes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 glass rounded-2xl p-6 border border-gold-500/10"
        >
          <h2 className="font-[Playfair_Display] text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-400" />
            Business Rules & Constraints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Penyewa Pribadi', rules: ['Wajib KTP + SIM A + KK', 'Jaminan pribadi (BPKB/Sertifikat)', 'Min. usia 21 tahun', 'SIM harus aktif'] },
              { title: 'Penyewa Corporate', rules: ['NIB + Akta + NPWP', 'PIC (Person In Charge) wajib', 'Guarantee Letter', 'Credit limit berdasarkan verifikasi'] },
              { title: 'Pembayaran', rules: ['DP 30-50% untuk konfirmasi', 'Pelunasan saat pick-up', 'Late payment = auto cancel', 'Refund policy: H-3 full, H-1 50%'] },
              { title: 'Inspeksi Kendaraan', rules: ['Check-in: foto 8 sudut + interior', 'Check-out: bandingkan kondisi', 'Damage = charge otomatis', 'Fuel level harus sama'] },
            ].map((section, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <h4 className="text-gold-300 font-medium text-sm mb-2">{section.title}</h4>
                <ul className="space-y-1">
                  {section.rules.map((rule, j) => (
                    <li key={j} className="text-xs text-gray-500 flex items-start gap-2">
                      <span className="text-gold-400 mt-0.5">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
