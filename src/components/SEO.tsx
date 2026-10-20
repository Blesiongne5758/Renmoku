import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  structuredData?: any;
}

export default function SEO({
  title = 'Renmoku - Rental Mobil Premium Terpercaya',
  description = 'Platform rental mobil premium dengan koleksi kendaraan mewah terbaik. Proses mudah, harga transparan, layanan profesional 24/7.',
  keywords = 'rental mobil, sewa mobil, rental mobil premium, sewa mobil mewah, rental mobil jakarta, sewa mobil jakarta, rental mobil murah, sewa mobil harian, sewa mobil mingguan, sewa mobil bulanan',
  image = 'https://renmoku.infinityfreeapp.com/og-image.jpg',
  url,
  type = 'website',
  structuredData,
}: SEOProps) {
  const location = useLocation();
  const currentUrl = url || `https://renmoku.infinityfreeapp.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', 'Renmoku', 'property');
    updateMetaTag('og:locale', 'id_ID', 'property');
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@renmoku_id');
    
    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'Renmoku Team');
    updateMetaTag('language', 'Indonesian');
    updateMetaTag('revisit-after', '7 days');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Structured Data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null;
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

// ============================================================================
// SEO COMPONENTS FOR SPECIFIC PAGES
// ============================================================================

export function HomepageSEO() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Renmoku',
    alternateName: 'Rental Mobil Ku',
    url: 'https://renmoku.infinityfreeapp.com',
    description: 'Platform rental mobil premium dengan koleksi kendaraan mewah terbaik',
    publisher: {
      '@type': 'Organization',
      name: 'Renmoku',
      logo: {
        '@type': 'ImageObject',
        url: 'https://renmoku.infinityfreeapp.com/logo.png',
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://renmoku.infinityfreeapp.com/fleet?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <SEO
      title="Renmoku - Rental Mobil Premium Terpercaya | Sewa Mobil Mudah & Aman"
      description="Platform rental mobil premium dengan koleksi kendaraan mewah terbaik. Proses mudah, harga transparan, layanan profesional 24/7. Sewa mobil harian, mingguan, bulanan."
      keywords="rental mobil, sewa mobil, rental mobil premium, sewa mobil mewah, rental mobil jakarta, sewa mobil jakarta, rental mobil murah"
      type="website"
      structuredData={structuredData}
    />
  );
}

export function FleetPageSEO() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Armada Kendaraan Renmoku',
    description: 'Koleksi kendaraan premium untuk disewa',
    numberOfItems: 50,
  };

  return (
    <SEO
      title="Armada Kendaraan Premium | Renmoku - Sewa Mobil Mewah"
      description="Jelajahi koleksi kendaraan premium kami. Toyota Alphard, Mercedes S-Class, BMW X5, dan banyak lagi. Semua kendaraan terawat dan berasuransi."
      keywords="armada kendaraan, koleksi mobil premium, sewa alphard, sewa mercedes, sewa bmw, rental mobil mewah"
      type="website"
      structuredData={structuredData}
    />
  );
}

export function VehicleDetailPageSEO({ vehicle }: { vehicle: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: `Sewa ${vehicle.brand} ${vehicle.model} ${vehicle.year} dengan harga terjangkau. Kapasitas ${vehicle.seats} penumpang, transmisi ${vehicle.transmission}.`,
    image: vehicle.images?.[0] || 'https://renmoku.infinityfreeapp.com/vehicle-default.jpg',
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.pricePerDay,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      url: `https://renmoku.infinityfreeapp.com/vehicle/${vehicle.id}`,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: vehicle.rating,
      reviewCount: vehicle.reviews,
    },
  };

  return (
    <SEO
      title={`Sewa ${vehicle.brand} ${vehicle.model} ${vehicle.year} | Renmoku`}
      description={`Sewa ${vehicle.brand} ${vehicle.model} ${vehicle.year} di Renmoku. Harga mulai Rp ${vehicle.pricePerDay.toLocaleString('id-ID')}/hari. Kapasitas ${vehicle.seats} penumpang, ${vehicle.transmission}.`}
      keywords={`sewa ${vehicle.brand}, sewa ${vehicle.model}, rental ${vehicle.brand} ${vehicle.model}, sewa mobil ${vehicle.brand}`}
      image={vehicle.images?.[0]}
      type="product"
      structuredData={structuredData}
    />
  );
}

export function BookingPageSEO() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Booking Rental Mobil Renmoku',
    description: 'Proses booking rental mobil yang mudah dan cepat. Pilih kendaraan, tentukan tanggal, dan konfirmasi pembayaran.',
    provider: {
      '@type': 'Organization',
      name: 'Renmoku',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Paket Sewa Mobil',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sewa Harian',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sewa Mingguan',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sewa Bulanan',
          },
        },
      ],
    },
  };

  return (
    <SEO
      title="Booking Rental Mobil | Renmoku - Pesan Mobil Sekarang"
      description="Booking rental mobil dengan mudah. Pilih kendaraan, tentukan tanggal sewa, dan konfirmasi pembayaran. Proses cepat dan aman."
      keywords="booking rental mobil, pesan mobil, sewa mobil online, booking mobil murah"
      type="service"
      structuredData={structuredData}
    />
  );
}

export function PaymentSuccessPageSEO() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Order',
    orderStatus: 'https://schema.org/OrderDelivered',
    orderDate: new Date().toISOString(),
  };

  return (
    <SEO
      title="Pembayaran Berhasil | Renmoku - Terima Kasih"
      description="Pembayaran Anda telah berhasil diproses. Detail booking telah dikirim ke email Anda. Terima kasih telah menggunakan layanan Renmoku."
      keywords="pembayaran berhasil, booking confirmed, rental mobil confirmed"
      type="website"
      structuredData={structuredData}
    />
  );
}

export function PaymentFailedPageSEO() {
  return (
    <SEO
      title="Pembayaran Gagal | Renmoku - Silakan Coba Lagi"
      description="Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau hubungi customer support kami untuk bantuan."
      keywords="pembayaran gagal, payment failed, error pembayaran"
      type="website"
    />
  );
}
