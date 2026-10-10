// ============================================================================
// SYARAT & KETENTUAN SEWA MOBIL — RENMOKU
// ============================================================================
// Dokumen ini berisi S&K untuk berbagai tipe penyewa.
// Setiap tipe user memiliki S&K yang berbeda sesuai kebutuhan bisnis.
// ============================================================================

export interface TermsSection {
  id: string;
  title: string;
  icon?: string;
  items: string[];
}

export interface TermsDocument {
  id: string;
  title: string;
  subtitle: string;
  userType: 'individual' | 'corporate' | 'owner';
  effectiveDate: string;
  version: string;
  sections: TermsSection[];
}

// ============================================================================
// S&K UNTUK PENYEWA PRIBADI (INDIVIDUAL)
// ============================================================================
export const individualTerms: TermsDocument = {
  id: 'terms-individual-v1',
  title: 'SYARAT DAN KETENTUAN SEWA MOBIL',
  subtitle: 'PENYEWA PRIBADI (INDIVIDUAL)',
  userType: 'individual',
  effectiveDate: '15 Januari 2025',
  version: '1.0.0',
  sections: [
    {
      id: 'syarat-penyewaan',
      title: '1. SYARAT PENYEWAAN',
      items: [
        'Penyewa wajib berusia minimal 21 tahun dan memiliki SIM A aktif.',
        'Penyewa wajib menyerahkan dokumen asli: KTP (Kartu Tanda Penduduk), SIM A (Surat Izin Mengemudi), dan KK (Kartu Keluarga) untuk verifikasi domisili.',
        'Penyewa wajib menyediakan jaminan berupa: KTP asli (ditahan selama masa sewa), ATAU BPKB kendaraan atas nama penyewa, ATAU uang jaminan minimal Rp 5.000.000.',
      ],
    },
    {
      id: 'pembayaran',
      title: '2. PEMBAYARAN',
      items: [
        'Penyewa wajib membayar DP minimal 50% dari total biaya sewa saat booking.',
        'Pelunasan dilakukan saat serah terima kendaraan.',
        'Pembayaran dapat dilakukan via transfer bank, kartu kredit, atau e-wallet.',
        'DP tidak dapat dikembalikan (non-refundable) jika pembatalan dilakukan < 24 jam.',
      ],
    },
    {
      id: 'tanggung-jawab',
      title: '3. TANGGUNG JAWAB PENYEWA',
      items: [
        'Penyewa bertanggung jawab penuh atas kendaraan selama masa sewa.',
        'Penyewa wajib mengembalikan kendaraan dalam kondisi sama seperti saat disewa.',
        'Kerusakan atau kehilangan menjadi tanggung jawab penyewa.',
        'Penyewa dilarang menggunakan kendaraan untuk: kegiatan ilegal, sewa ulang kepada pihak ketiga, mengemudi di bawah pengaruh alkohol/narkoba, atau melanggar lalu lintas.',
      ],
    },
    {
      id: 'sanksi-denda',
      title: '4. SANKSI & DENDA',
      items: [
        'Keterlambatan pengembalian: Rp 100.000/jam (maksimal 3 jam), setelahnya dihitung sewa 1 hari penuh.',
        'Pelanggaran S&K: Jaminan akan disita dan booking dibatalkan sepihak.',
      ],
    },
    {
      id: 'asuransi',
      title: '5. ASURANSI',
      items: [
        'Kendaraan telah dilengkapi asuransi All Risk.',
        'Penyewa wajib membayar biaya risiko (own risk) Rp 300.000 per kejadian.',
      ],
    },
    {
      id: 'pembatalan',
      title: '6. PEMBATALAN',
      items: [
        'Pembatalan > 7 hari sebelum sewa: Refund DP 80%.',
        'Pembatalan 3-7 hari sebelum sewa: Refund DP 50%.',
        'Pembatalan < 3 hari: DP tidak dikembalikan.',
      ],
    },
  ],
};

// ============================================================================
// S&K UNTUK PENYEWA CORPORATE
// ============================================================================
export const corporateTerms: TermsDocument = {
  id: 'terms-corporate-v1',
  title: 'SYARAT DAN KETENTUAN SEWA MOBIL',
  subtitle: 'PENYEWA CORPORATE (PERUSAHAAN)',
  userType: 'corporate',
  effectiveDate: '15 Januari 2025',
  version: '1.0.0',
  sections: [
    {
      id: 'syarat-penyewaan',
      title: '1. SYARAT PENYEWAAN',
      items: [
        'Perusahaan wajib memiliki NIB (Nomor Induk Berusaha) yang masih berlaku.',
        'Perusahaan wajib menyerahkan dokumen: Akta Pendirian, NPWP Perusahaan, dan KTP PIC (Person in Charge).',
        'Perusahaan wajib menyediakan Guarantee Letter (Surat Jaminan) yang ditandatangani oleh direktur.',
        'PIC yang ditunjuk wajib berusia minimal 21 tahun dan memiliki SIM A aktif.',
      ],
    },
    {
      id: 'pembayaran',
      title: '2. PEMBAYARAN',
      items: [
        'Perusahaan wajib membayar DP minimal 30% dari total biaya sewa saat booking.',
        'Pelunasan dapat dilakukan via transfer bank korporat atau invoice bulanan.',
        'Untuk klien korporat tetap, tersedia opsi pembayaran tempo 14 hari.',
        'DP tidak dapat dikembalikan jika pembatalan dilakukan < 48 jam.',
      ],
    },
    {
      id: 'tanggung-jawab',
      title: '3. TANGGUNG JAWAB PERUSAHAAN',
      items: [
        'Perusahaan bertanggung jawab penuh atas kendaraan selama masa sewa.',
        'Perusahaan bertanggung jawab atas tindakan PIC dan driver yang ditunjuk.',
        'Kendaraan hanya boleh digunakan untuk keperluan bisnis perusahaan.',
        'Perusahaan dilarang memindahtangankan kendaraan kepada pihak ketiga tanpa izin tertulis.',
      ],
    },
    {
      id: 'sanksi-denda',
      title: '4. SANKSI & DENDA',
      items: [
        'Keterlambatan pengembalian: Rp 150.000/jam (maksimal 3 jam), setelahnya dihitung sewa 1 hari penuh.',
        'Pelanggaran S&K: Guarantee Letter akan dicairkan dan booking dibatalkan sepihak.',
        'Keterlambatan pembayaran invoice: Denda 2% per bulan dari total tagihan.',
      ],
    },
    {
      id: 'asuransi',
      title: '5. ASURANSI',
      items: [
        'Kendaraan telah dilengkapi asuransi All Risk.',
        'Perusahaan wajib membayar biaya risiko (own risk) Rp 500.000 per kejadian.',
        'Untuk kontrak jangka panjang (> 6 bulan), tersedia paket asuransi tambahan.',
      ],
    },
    {
      id: 'pembatalan',
      title: '6. PEMBATALAN',
      items: [
        'Pembatalan > 14 hari sebelum sewa: Refund DP 100%.',
        'Pembatalan 7-14 hari sebelum sewa: Refund DP 70%.',
        'Pembatalan 3-7 hari sebelum sewa: Refund DP 50%.',
        'Pembatalan < 3 hari: DP tidak dikembalikan.',
      ],
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mendapatkan dokumen S&K berdasarkan tipe user
 */
export const getTermsByUserType = (
  userType: 'individual' | 'corporate' | 'owner'
): TermsDocument => {
  switch (userType) {
    case 'individual':
      return individualTerms;
    case 'corporate':
      return corporateTerms;
    default:
      return individualTerms;
  }
};

/**
 * Format tanggal efektif S&K
 */
export const formatEffectiveDate = (date: string): string => {
  return `Berlaku efektif sejak ${date}`;
};

/**
 * Ringkasan poin penting S&K
 */
export const getTermsSummary = (terms: TermsDocument): string[] => {
  const summary: string[] = [];
  terms.sections.forEach((section) => {
    summary.push(`${section.title}: ${section.items[0]}`);
  });
  return summary;
};
