# 📜 Syarat & Ketentuan (Terms & Conditions)

## Overview

Sistem Syarat & Ketentuan (S&K) yang terstruktur dan terintegrasi ke dalam aplikasi Renmoku. S&K berbeda untuk setiap tipe user (Individual/Corporate) dan ditampilkan secara interaktif di Step 5 Booking Flow serta halaman terpisah.

---

## 🎯 Fitur Utama

### 1. **S&K untuk Penyewa Pribadi (Individual)**

**6 Bagian Utama:**

#### 1. SYARAT PENYEWAAN
- Penyewa wajib berusia minimal 21 tahun dan memiliki SIM A aktif
- Dokumen asli: KTP, SIM A, KK
- Jaminan: KTP asli / BPKB / Uang minimal Rp 5.000.000

#### 2. PEMBAYARAN
- DP minimal 50% saat booking
- Pelunasan saat serah terima
- Metode: Transfer bank, kartu kredit, e-wallet
- DP non-refundable jika pembatalan < 24 jam

#### 3. TANGGUNG JAWAB PENYEWA
- Tanggung jawab penuh atas kendaraan
- Kembalikan dalam kondisi sama
- Kerusakan/kehilangan tanggung jawab penyewa
- Larangan: kegiatan ilegal, sewa ulang, mabuk, melanggar lalu lintas

#### 4. SANKSI & DENDA
- Keterlambatan: Rp 100.000/jam (max 3 jam), lalu 1 hari penuh
- Pelanggaran: Jaminan disita, booking dibatalkan

#### 5. ASURANSI
- Asuransi All Risk sudah termasuk
- Own risk: Rp 300.000 per kejadian

#### 6. PEMBATALAN
- > 7 hari: Refund DP 80%
- 3-7 hari: Refund DP 50%
- < 3 hari: DP tidak dikembalikan

---

### 2. **S&K untuk Penyewa Corporate**

**6 Bagian Utama:**

#### 1. SYARAT PENYEWAAN
- NIB (Nomor Induk Berusaha) yang masih berlaku
- Dokumen: Akta Pendirian, NPWP, KTP PIC
- Guarantee Letter dari direktur
- PIC minimal 21 tahun dengan SIM A aktif

#### 2. PEMBAYARAN
- DP minimal 30% saat booking
- Pelunasan via transfer korporat atau invoice bulanan
- Opsi pembayaran tempo 14 hari untuk klien tetap
- DP non-refundable jika pembatalan < 48 jam

#### 3. TANGGUNG JAWAB PERUSAHAAN
- Tanggung jawab penuh atas kendaraan
- Tanggung jawab atas tindakan PIC dan driver
- Hanya untuk keperluan bisnis
- Dilarang memindahtangankan tanpa izin

#### 4. SANKSI & DENDA
- Keterlambatan: Rp 150.000/jam (max 3 jam)
- Pelanggaran: Guarantee Letter dicairkan
- Keterlambatan pembayaran: Denda 2% per bulan

#### 5. ASURANSI
- Asuransi All Risk sudah termasuk
- Own risk: Rp 500.000 per kejadian
- Paket asuransi tambahan untuk kontrak > 6 bulan

#### 6. PEMBATALAN
- > 14 hari: Refund DP 100%
- 7-14 hari: Refund DP 70%
- 3-7 hari: Refund DP 50%
- < 3 hari: DP tidak dikembalikan

---

## 🎨 Komponen UI

### TermsAndConditions Component

**Fitur:**
- ✅ **Accordion Sections** - Expandable/collapsible per bagian
- ✅ **Numbered Sections** - Nomor urut untuk setiap bagian
- ✅ **Checklist Items** - CheckCircle icon untuk setiap item
- ✅ **Agreement Checkbox** - Checkbox dengan custom styling
- ✅ **Important Notice** - Alert box di bagian atas
- ✅ **Scrollable Content** - Max height dengan scroll

**Props:**
```typescript
interface Props {
  terms: TermsDocument;
  onAgree: (agreed: boolean) => void;
  agreed: boolean;
}
```

**Usage:**
```tsx
<TermsAndConditions
  terms={getTermsByUserType('individual')}
  agreed={formData.agreeTerms}
  onAgree={(agreed) => setFormData({ ...formData, agreeTerms: agreed })}
/>
```

---

## 📄 Halaman S&K Terpisah

### TermsPage

**Fitur:**
- ✅ **User Type Selector** - Toggle antara Individual/Corporate
- ✅ **Full Terms Display** - Tampilan lengkap S&K
- ✅ **Back Button** - Navigasi kembali ke beranda
- ✅ **Contact Info** - Email untuk pertanyaan legal
- ✅ **Version Info** - Tanggal efektif dan versi dokumen

**Route:** `/terms`

**Navigation:**
- Dari footer LandingPage: "Syarat & Ketentuan"
- Dari booking flow: Link di agreement text

---

## 🔄 Integrasi dengan Booking Flow

### Step 5: Terms & Confirmation

**Sebelum:**
- S&K sederhana dalam 1 box
- Checkbox agreement
- E-signature

**Sesudah:**
- ✅ Komponen TermsAndConditions lengkap
- ✅ Accordion sections untuk setiap bagian
- ✅ Agreement checkbox yang terintegrasi
- ✅ E-signature tetap ada

**Flow:**
```
Step 1: Durasi & Opsi
  ↓
Step 2: Data Penyewa
  ↓
Step 3: Rencana Perjalanan
  ↓
Step 4: Jaminan & Pembayaran
  ↓
Step 5: S&K & Konfirmasi ← S&K lengkap ditampilkan di sini
  ↓
Success Page
```

---

## 📊 Data Structure

### TermsDocument Interface
```typescript
interface TermsDocument {
  id: string;
  title: string;
  subtitle: string;
  userType: 'individual' | 'corporate' | 'owner';
  effectiveDate: string;
  version: string;
  sections: TermsSection[];
}

interface TermsSection {
  id: string;
  title: string;
  icon?: string;
  items: string[];
}
```

### Data Files
- `src/data/termsAndConditions.ts` - Data S&K lengkap
- `src/components/TermsAndConditions.tsx` - Komponen UI
- `src/pages/TermsPage.tsx` - Halaman terpisah

---

## 🎬 Animasi

### Accordion Animation
```tsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Section Stagger
```tsx
{terms.sections.map((section, index) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
))}
```

---

## 🎨 Design System

### Section Card
```tsx
<div className="rounded-xl neu-soft overflow-hidden">
  {/* Header */}
  <button className="w-full p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gold-500/10">
        <span className="text-gold-400 font-bold text-sm">{index + 1}</span>
      </div>
      <h3 className="text-white font-semibold text-sm">{section.title}</h3>
    </div>
    <ChevronDown className="w-5 h-5 text-gray-500" />
  </button>
  
  {/* Content */}
  {expanded && (
    <div className="px-4 pb-4">
      {section.items.map((item) => (
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-gold-400" />
          <p className="text-sm text-gray-300">{item}</p>
        </div>
      ))}
    </div>
  )}
</div>
```

### Agreement Checkbox
```tsx
<label className="flex items-start gap-3 cursor-pointer">
  <input type="checkbox" className="sr-only" />
  <div className={`w-5 h-5 rounded border-2 ${
    agreed ? 'bg-gold-500 border-gold-500' : 'border-gray-600'
  }`}>
    {agreed && <CheckCircle2 className="w-4 h-4 text-luxury-900" />}
  </div>
  <p className="text-sm text-gray-300">
    Saya telah membaca dan menyetujui...
  </p>
</label>
```

---

## 📱 Responsive Design

### Mobile (< 640px)
- User type selector: Stack vertical
- Sections: Full width
- Padding: p-4

### Desktop (≥ 640px)
- User type selector: Horizontal
- Sections: Full width
- Padding: p-6 sm:p-8

---

## 🔒 Legal Compliance

### Data Privacy
- S&K disimpan di database (future implementation)
- Version control untuk setiap perubahan
- Audit trail untuk persetujuan user

### User Consent
- Checkbox wajib dicentang sebelum lanjut
- Timestamp persetujuan dicatat
- E-signature untuk validasi tambahan

---

## 🚀 Future Enhancements

### Phase 2
- [ ] Digital signature pad (canvas)
- [ ] PDF generation untuk S&K yang ditandatangani
- [ ] Email notification dengan attachment PDF
- [ ] Version history untuk S&K

### Phase 3
- [ ] Multi-language support (EN, ID)
- [ ] S&K untuk Owner (Fleet Owner)
- [ ] Custom S&K per kendaraan
- [ ] Integration dengan e-KTP verification

---

## ✅ Checklist

### Data
- [x] S&K Individual lengkap (6 bagian)
- [x] S&K Corporate lengkap (6 bagian)
- [x] Helper functions untuk akses data
- [x] Type definitions

### UI Components
- [x] TermsAndConditions component
- [x] Accordion sections
- [x] Agreement checkbox
- [x] Important notice
- [x] Scrollable content

### Pages
- [x] TermsPage dengan user type selector
- [x] Route di App.tsx
- [x] Link di footer LandingPage

### Integration
- [x] Step 5 Booking Flow
- [x] State management (agreed)
- [x] Navigation flow

---

## 📚 Related Documentation

- [USER-FLOW.md](./USER-FLOW.md) - User flow implementation
- [BOOKING-FLOW-STEP2-UPDATE.md](./BOOKING-FLOW-STEP2-UPDATE.md) - Step 2 update
- [VEHICLE-DETAIL-PAGE.md](./VEHICLE-DETAIL-PAGE.md) - Vehicle detail page

---

## 🎉 Summary

**Status**: ✅ Complete

Sistem S&K berhasil diimplementasikan dengan:

✅ **S&K Individual** - 6 bagian lengkap untuk penyewa pribadi  
✅ **S&K Corporate** - 6 bagian lengkap untuk penyewa corporate  
✅ **Interactive UI** - Accordion sections dengan animasi smooth  
✅ **TermsPage** - Halaman terpisah dengan user type selector  
✅ **Booking Integration** - Terintegrasi di Step 5 booking flow  
✅ **Responsive Design** - Mobile-first dengan breakpoints  

**Build Status**: ✅ Success (468.62 kB gzip: 125.86 kB)

---

**Last Updated**: 2025-01-15  
**Version**: 1.0.0  
**Author**: Renmoku Tech Team
