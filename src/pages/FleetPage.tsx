import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, useAppStore } from '../stores/useAppStore';
import { vehicles } from '../data/mockData';
import VehicleCard from '../components/VehicleCard';
import VehicleShowcase360 from '../components/VehicleShowcase360';
import SearchFilter from '../components/SearchFilter';
import { supabase } from '../lib/supabase';
import VehicleModelViewer from '../components/VehicleModelViewer';

type PublishedModel = { id:string; brand:string; model:string; year:number; transmission:string; capacity:number; fuel_type:string; price_daily:number; location:string; spin_model_url:string };

export default function FleetPage() {
  const { setCurrentPage, setSelectedVehicle, setShowBookingModal } = useAppStore();
  const [showcase360, setShowcase360] = useState<Vehicle | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [publishedModels, setPublishedModels] = useState<PublishedModel[]>([]);

  useEffect(() => {
    let active = true;
    void supabase.from('published_spin_vehicles').select('id,brand,model,year,transmission,capacity,fuel_type,price_daily,location,spin_model_url').order('created_at',{ascending:false})
      .then(({data,error}) => { if(active && !error) setPublishedModels((data ?? []) as PublishedModel[]); });
    return () => { active = false; };
  }, []);

  const handleBook = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
    setCurrentPage('booking');
  };

  const openPublishedModel = (item: PublishedModel) => {
    const transmission = item.transmission.toLowerCase() === 'manual' ? 'manual' : 'automatic';
    const validFuel = ['bensin','diesel','hybrid','electric'].includes(item.fuel_type.toLowerCase()) ? item.fuel_type.toLowerCase() as Vehicle['fuel'] : 'bensin';
    const price = Number(item.price_daily);
    setSelectedVehicle({
      id:item.id,name:`${item.brand} ${item.model}`,brand:item.brand,type:'luxury',year:item.year,transmission,
      seats:item.capacity,fuel:validFuel,pricePerDay:price,pricePerWeek:price*7,pricePerMonth:price*30,
      image:'',images:[],features:[],available:true,ownerId:'',location:item.location,rating:0,reviews:0,model3D:item.spin_model_url,
    });
    setCurrentPage('vehicle-detail');
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-[Playfair_Display] text-3xl sm:text-5xl font-bold text-white mb-4">
            Armada <span className="text-gold-gradient">Premium</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Pilih dari koleksi kendaraan mewah terbaik kami. Setiap unit terawat sempurna
            dan siap menemani perjalanan Anda.
          </p>
        </motion.div>

        {/* Search Filter */}
        <div className="mb-10">
          <SearchFilter />
        </div>

        {/* View controls */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            Menampilkan <span className="text-gold-400 font-medium">{vehicles.length}</span> kendaraan
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-gold-500/10 text-gold-400' : 'text-gray-500 hover:text-white'}`}
            >
              ☰
            </button>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {vehicles.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              index={index}
              onView360={setShowcase360}
              onBook={handleBook}
            />
          ))}
        </div>

        {publishedModels.length > 0 && <section className="mt-16 border-t border-white/10 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-gold-400">Showroom digital</p><h2 className="mt-2 font-[Playfair_Display] text-2xl font-bold text-white sm:text-3xl">Model kendaraan 3D</h2><p className="mt-2 max-w-xl text-sm text-gray-400">Putar model kendaraan yang dipublikasikan pemilik rental setelah ditinjau.</p></div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{publishedModels.length} model tersedia</span>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {publishedModels.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
              <VehicleModelViewer src={item.spin_model_url} title={`${item.brand} ${item.model}`} className="h-64 rounded-none" />
              <div className="p-5"><h3 className="text-lg font-semibold text-white">{item.brand} {item.model}</h3><p className="mt-1 text-sm text-gray-400">{item.year} · {item.capacity} kursi · {item.location}</p><p className="mt-4 text-sm text-gray-300">Mulai <strong className="text-gold-300">Rp {Number(item.price_daily).toLocaleString('id-ID')}</strong> / hari</p><button onClick={()=>openPublishedModel(item)} className="mt-4 w-full rounded-lg border border-gold-400/30 px-4 py-2 text-sm font-medium text-gold-200 transition hover:bg-gold-400/10">Lihat kendaraan & sewa</button></div>
            </article>)}
          </div>
        </section>}

        {/* Price calculator info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 glass rounded-2xl p-6 sm:p-8 border border-gold-500/10"
        >
          <h3 className="font-[Playfair_Display] text-xl font-bold text-white mb-4">
            💰 Kalkulator Harga Sewa
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Harian', discount: '0%', desc: 'Sewa 1-6 hari' },
              { label: 'Mingguan', discount: '10% OFF', desc: 'Sewa 7-29 hari' },
              { label: 'Bulanan', discount: '20% OFF', desc: 'Sewa 30+ hari' },
            ].map((plan, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                <p className="text-gold-400 font-bold text-lg">{plan.discount}</p>
                <p className="text-white font-medium">{plan.label}</p>
                <p className="text-gray-500 text-xs mt-1">{plan.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 360 Showcase Modal */}
      <AnimatePresence>
        {showcase360 && (
          <VehicleShowcase360
            vehicle={showcase360}
            onClose={() => setShowcase360(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
