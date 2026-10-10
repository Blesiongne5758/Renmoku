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
  id: 'terms-corporate-v2',
  title: 'SYARAT DAN KETENTUAN SEWA MOBIL',
  subtitle: 'PENYEWA CORPORATE (PERUSAHAAN)',
  userType: 'corporate',
  effectiveDate: '15 Januari 2025',
  version: '2.0.0',
  sections: [
    {
      id: 'syarat-penyewaan',
      title: '1. SYARAT PENYEWAAN',
      items: [
        'Perusahaan wajib memiliki legalitas lengkap: NIB (Nomor Induk Berusaha), Akta Pendirian Perusahaan & Perubahan Terakhir, dan NPWP Badan Usaha.',
        'Perusahaan wajib menunjuk PIC (Person in Charge) yang bertanggung jawab atas seluruh transaksi dan penggunaan kendaraan.',
        'PIC wajib menyerahkan dokumen asli: KTP asli, SIM A aktif, dan Surat Tugas dari perusahaan.',
        'Jaminan berupa: Guarantee Letter (GL) dari perusahaan yang ditandatangani direktur, ATAU deposit perusahaan minimal Rp 10.000.000.',
      ],
    },
    {
      id: 'pembayaran',
      title: '2. PEMBAYARAN',
      items: [
        'Opsi pembayaran: DP 30% + pelunasan saat serah terima, ATAU invoice dengan termin (untuk kontrak jangka panjang).',
        'Pembayaran via transfer bank ke rekening perusahaan Renmoku.',
        'Faktur pajak akan diterbitkan sesuai ketentuan perpajakan yang berlaku.',
        'Untuk klien korporat tetap dengan kontrak > 6 bulan, tersedia opsi pembayaran tempo 30 hari.',
      ],
    },
    {
      id: 'tanggung-jawab',
      title: '3. TANGGUNG JAWAB PERUSAHAAN',
      items: [
        'Perusahaan bertanggung jawab penuh atas penggunaan kendaraan oleh PIC dan/atau karyawan yang ditunjuk.',
        'Perusahaan wajib memastikan semua pengemudi memiliki SIM A yang masih aktif dan berlaku.',
        'Kerusakan atau kehilangan kendaraan selama masa sewa menjadi tanggung jawab penuh perusahaan.',
        'Kendaraan hanya boleh digunakan untuk kepentingan bisnis perusahaan dan dilarang untuk penggunaan pribadi.',
      ],
    },
    {
      id: 'sanksi-denda',
      title: '4. SANKSI & DENDA',
      items: [
        'Keterlambatan pengembalian: Rp 150.000/jam (maksimal 5 jam), setelahnya dihitung sewa 1 hari penuh.',
        'Pelanggaran S&K: Deposit akan dipotong sesuai nilai kerusakan, dan perusahaan akan diblokir dari platform Renmoku.',
        'Keterlambatan pembayaran invoice: Denda 2% per bulan dari total tagihan yang belum dibayar.',
      ],
    },
    {
      id: 'asuransi',
      title: '5. ASURANSI',
      items: [
        'Kendaraan telah dilengkapi asuransi All Risk yang mencakup kerusakan dan kehilangan.',
        'Biaya risiko (own risk) Rp 500.000 per kejadian ditanggung oleh perusahaan.',
        'Untuk kontrak jangka panjang (> 6 bulan), tersedia paket asuransi tambahan dengan premi khusus.',
      ],
    },
    {
      id: 'pembatalan',
      title: '6. PEMBATALAN',
      items: [
        'Pembatalan > 14 hari sebelum sewa: Refund DP 100%.',
        'Pembatalan 7-14 hari sebelum sewa: Refund DP 70%.',
        'Pembatalan < 7 hari sebelum sewa: DP tidak dikembalikan (non-refundable).',
      ],
    },
    {
      id: 'kontrak-jangka-panjang',
      title: '7. KONTRAK JANGKA PANJANG',
      items: [
        'Untuk sewa dengan durasi > 1 bulan, akan dibuat perjanjian kontrak terpisah yang lebih komprehensif.',
        'Diskon khusus hingga 30% untuk kontrak tahunan dengan komitmen minimal 12 bulan.',
        'Kontrak jangka panjang mencakup SLA (Service Level Agreement) dan prioritas ketersediaan kendaraan.',
        'Review kontrak dilakukan setiap 6 bulan untuk penyesuaian harga dan kondisi.',
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
