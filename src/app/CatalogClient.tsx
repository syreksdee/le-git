'use client';

import { useState } from 'react';

type PackageItem = {
  id: number;
  sizeLabel: string;
  name: string;
  pieceCount: number;
  price: number;
};

type VariantItem = {
  id: number;
  name: string;
  subtitle: string | null;
  description: string;
  imageUrl: string;
  isSoldOut: boolean;
  packages: PackageItem[];
};

const DELIVERY_OPTIONS = [
  'Self Pick-up',
  'Go-Send / Instant Courier',
  'Expedition / Ekspedisi',
];

const WHATSAPP_NUMBER = '62895422955202'; // Replace with client's WA number

export default function CatalogClient({
  variants,
}: {
  variants: VariantItem[];
}) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(
    variants[0]?.id ?? 1
  );
  const [selectedPackages, setSelectedPackages] = useState<
    Record<number, number>
  >(() => {
    const initial: Record<number, number> = {};
    variants.forEach((v) => {
      if (v.packages[0]) initial[v.id] = v.packages[0].id;
    });
    return initial;
  });
  const [deliveryMethod, setDeliveryMethod] = useState<string>(
    DELIVERY_OPTIONS[0]
  );

  const formatIDR = (amount: number) =>
    'Rp. ' + amount.toLocaleString('id-ID');

  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];
  const activePkgId = activeVariant
    ? selectedPackages[activeVariant.id]
    : undefined;
  const activePackage = activeVariant?.packages.find(
    (p) => p.id === activePkgId
  );

  const buildWhatsAppLink = () => {
    if (!activeVariant || !activePackage) {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        'Halo Lé Git! Saya ingin bertanya tentang produk cookies-nya.'
      )}`;
    }
    const message = `Halo Lé Git! Saya tertarik untuk memesan / menanyakan info:\n• Varian: ${activeVariant.name}\n• Paket: ${activePackage.sizeLabel} - ${activePackage.name} (${formatIDR(activePackage.price)})\n• Pengiriman: ${deliveryMethod}\n\nApakah stok tersedia?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#2C1E16] pb-28">
      {/* Header / Hero */}
      <header className="bg-[#3B2314] text-[#FAF6F0] px-5 pt-10 pb-12 rounded-b-3xl shadow-md">
        <div className="max-w-xl mx-auto">
          <span className="inline-block text-xs uppercase tracking-widest bg-[#D99B52]/20 text-[#F3C68F] px-3 py-1 rounded-full mb-3">
            Artisanal Homemade Cookies
          </span>
          <h1 className="text-4xl font-bold tracking-tight">Lé Git</h1>
          <p className="mt-2 text-sm text-[#E6D5C3] leading-relaxed">
            Freshly baked small-batch cookies crafted with premium chocolate,
            roasted nuts, and real butter. Browse our signature variants and
            package sizes below.
          </p>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 -mt-6 space-y-6">
        {/* Packaging & Shipping Info Banner */}
        <section className="bg-white border border-[#E8D8C8] rounded-2xl p-4 shadow-sm text-xs space-y-2">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[#3B2314]">📦 Packaging:</span>
            <span className="text-[#5C4332]">
              All prices <strong>include box packaging & bubble wrap</strong>{' '}
              (sudah termasuk packing dus dan bubble wrap).
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-[#3B2314]">🚚 Shipping:</span>
            <span className="text-[#5C4332]">
              Prices <strong>exclude shipping fees</strong> (belum termasuk
              ongkir).
            </span>
          </div>
        </section>

        {/* Cookie Variant Cards */}
        <section className="space-y-5">
          <h2 className="text-lg font-bold text-[#3B2314] px-1">
            Signature Cookie Variants
          </h2>

          {variants.map((variant) => {
            const currentPkgId =
              selectedPackages[variant.id] ?? variant.packages[0]?.id;
            const currentPkg =
              variant.packages.find((p) => p.id === currentPkgId) ??
              variant.packages[0];
            const isSelectedCard = selectedVariantId === variant.id;

            return (
              <div
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={`bg-white rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                  isSelectedCard
                    ? 'border-[#8C4A27] ring-2 ring-[#8C4A27]/20 shadow-md'
                    : 'border-[#E8D8C8] shadow-sm'
                }`}
              >
                <div className="relative h-52 w-full bg-[#EFE5D8]">
                  <img
                    src={variant.imageUrl}
                    alt={variant.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${
                      variant.isSoldOut ? 'opacity-50 grayscale' : ''
                    }`}
                  />
                  {variant.isSoldOut && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Sold Out
                    </span>
                  )}
                  {isSelectedCard && !variant.isSoldOut && (
                    <span className="absolute top-3 left-3 bg-[#3B2314] text-[#F3C68F] text-xs font-semibold px-3 py-1 rounded-full">
                      Selected for Inquiry
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2C1E16]">
                      {variant.name}
                    </h3>
                    {variant.subtitle && (
                      <p className="text-xs font-medium text-[#8C4A27]">
                        {variant.subtitle}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-[#5C4332] leading-relaxed">
                      {variant.description}
                    </p>
                  </div>

                  {/* Interactive Package Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#7A5C48]">
                      Choose Size & Package:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {variant.packages.map((pkg) => {
                        const active = pkg.id === currentPkg?.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVariantId(variant.id);
                              setSelectedPackages((prev) => ({
                                ...prev,
                                [variant.id]: pkg.id,
                              }));
                            }}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-sm transition ${
                              active
                                ? 'bg-[#3B2314] text-white border-[#3B2314]'
                                : 'bg-[#FAF6F0] text-[#2C1E16] border-[#E0CEBC] hover:border-[#8C4A27]'
                            }`}
                          >
                            <div>
                              <span className="block text-[11px] opacity-80">
                                {pkg.sizeLabel}
                              </span>
                              <span className="font-semibold">{pkg.name}</span>
                            </div>
                            <span className="font-bold">
                              {formatIDR(pkg.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Fulfillment / Delivery Options */}
        <section className="bg-white border border-[#E8D8C8] rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#3B2314]">
            Preferred Fulfillment Method
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {DELIVERY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDeliveryMethod(option)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-left flex items-center justify-between ${
                  deliveryMethod === option
                    ? 'border-[#8C4A27] bg-[#FAF6F0] text-[#3B2314] font-semibold'
                    : 'border-[#E8D8C8] text-[#5C4332]'
                }`}
              >
                <span>{option}</span>
                <span>{deliveryMethod === option ? '●' : '○'}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Floating WhatsApp CTA */}
      <div className="fixed bottom-4 inset-x-0 px-4 z-50">
        <div className="max-w-xl mx-auto">
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg transition"
          >
            <div className="text-left">
              <span className="block text-xs font-normal opacity-95">
                {activeVariant?.name} • {activePackage?.name}
              </span>
              <span className="text-sm">Order / Ask via WhatsApp</span>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
              {activePackage ? formatIDR(activePackage.price) : 'Chat'} →
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}