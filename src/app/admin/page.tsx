'use client';

import { useState } from 'react';

type PackageItem = {
  id: number;
  sizeLabel: string;
  name: string;
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

const NEW_VARIANT_PACKAGES = [
  { label: 'Regular Size (8 cm) - Reguler Package (3 pcs)', price: '35000' },
  { label: 'Regular Size (8 cm) - Medium Package (6 pcs)', price: '55000' },
  { label: 'Regular Size (8 cm) - Large Package (10 pcs)', price: '85000' },
  { label: 'Mini Bites (5 cm) - Mini Bites Package (12 pcs)', price: '60000' },
];

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [savingPickupAddress, setSavingPickupAddress] = useState(false);

  // New Flavor Form
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [packagePrices, setPackagePrices] = useState(
    NEW_VARIANT_PACKAGES.map((pkg) => pkg.price)
  );

  const fetchVariants = async (pwd: string) => {
    setLoading(true);
    const res = await fetch('/api/admin', {
      headers: { 'x-admin-password': pwd },
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setVariants(data.variants);
      setPickupAddress(data.storeSettings.pickupAddress);
      setAuthenticated(true);
    } else {
      alert('Wrong admin password');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVariants(password);
  };

  const toggleSoldOut = async (variant: VariantItem) => {
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        type: 'toggle_sold_out',
        variantId: variant.id,
        isSoldOut: !variant.isSoldOut,
      }),
    });
    fetchVariants(password);
  };

  const updatePrice = async (packageId: number, newPrice: string) => {
    const parsed = Number(newPrice);
    if (!parsed || parsed < 0) return;

    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        type: 'update_price',
        packageId,
        price: parsed,
      }),
    });
    fetchVariants(password);
  };

  const updateImage = async (variantId: number, url: string) => {
    if (!url.trim()) return;
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        type: 'update_image',
        variantId,
        imageUrl: url,
      }),
    });
    fetchVariants(password);
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        name,
        subtitle,
        description,
        imageUrl,
        packagePrices: packagePrices.map(Number),
      }),
    });
    if (!res.ok) {
      alert(
        'Could not save the variant. Check the package prices and try again.'
      );
      return;
    }

    setName('');
    setSubtitle('');
    setDescription('');
    setImageUrl('');
    setPackagePrices(NEW_VARIANT_PACKAGES.map((pkg) => pkg.price));
    fetchVariants(password);
  };

  const savePickupAddress = async () => {
    setSavingPickupAddress(true);
    const res = await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
      body: JSON.stringify({
        type: 'update_pickup_address',
        pickupAddress,
      }),
    });
    setSavingPickupAddress(false);
    if (!res.ok) {
      alert('Could not save the pickup address.');
      return;
    }
    const data = await res.json();
    setPickupAddress(data.storeSettings.pickupAddress);
  };

  const handleDeleteVariant = async (id: number) => {
    if (!confirm('Delete this cookie variant?')) return;
    await fetch(`/api/admin?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    });
    fetchVariants(password);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white border border-[#E8D8C8] p-6 rounded-2xl shadow-sm w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold text-[#3B2314]">Lé Git Admin</h1>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#D8C3AE] rounded-xl px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3B2314] text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? 'Checking...' : 'Unlock Dashboard'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF6F0] text-[#2C1E16] p-4 pb-16">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#3B2314]">Lé Git Admin</h1>
          <a href="/" className="text-xs underline text-[#8C4A27]">
            ← View Storefront
          </a>
        </div>

        {/* Add New Flavor Form */}
        <form
          onSubmit={handleAddVariant}
          className="bg-white border border-[#E8D8C8] rounded-2xl p-4 space-y-3 shadow-sm"
        >
          <h2 className="font-bold text-sm text-[#3B2314]">
            + Add New Cookie Flavor
          </h2>
          <input
            type="text"
            placeholder="Variant Name (e.g., Matcha White Choco)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-[#E0CEBC] rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="text"
            placeholder="Subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full border border-[#E0CEBC] rounded-xl px-3 py-2.5 text-sm"
          />
          <textarea
            placeholder="Flavor description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={2}
            className="w-full border border-[#E0CEBC] rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border border-[#E0CEBC] rounded-xl px-3 py-2.5 text-sm"
          />
          <fieldset className="space-y-2 rounded-xl border border-[#E8D8C8] p-3">
            <legend className="px-1 text-xs font-semibold text-[#7A5C48]">
              Initial package prices (IDR)
            </legend>
            {NEW_VARIANT_PACKAGES.map((pkg, index) => (
              <label
                key={pkg.label}
                className="flex items-center justify-between gap-3 text-xs text-[#5C4332]"
              >
                <span>{pkg.label}</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={packagePrices[index]}
                  onChange={(event) =>
                    setPackagePrices((prices) =>
                      prices.map((price, priceIndex) =>
                        priceIndex === index ? event.target.value : price
                      )
                    )
                  }
                  className="w-28 rounded-lg border border-[#E0CEBC] px-2.5 py-1.5 text-right font-semibold text-[#2C1E16]"
                />
              </label>
            ))}
          </fieldset>
          <button
            type="submit"
            className="w-full bg-[#3B2314] text-white font-semibold py-3 rounded-xl text-sm"
          >
            Save New Flavor
          </button>
        </form>

        <section className="bg-white border border-[#E8D8C8] rounded-2xl p-4 space-y-3 shadow-sm">
          <h2 className="font-bold text-sm text-[#3B2314]">
            Pickup location
          </h2>
          <label className="block space-y-1.5 text-xs font-medium text-[#7A5C48]">
            Address shown to customers
            <textarea
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
              rows={2}
              required
              className="w-full border border-[#E0CEBC] rounded-xl px-3 py-2.5 text-sm font-normal text-[#2C1E16]"
            />
          </label>
          <button
            type="button"
            onClick={savePickupAddress}
            disabled={savingPickupAddress || !pickupAddress.trim()}
            className="w-full bg-[#3B2314] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60"
          >
            {savingPickupAddress ? 'Saving...' : 'Save pickup address'}
          </button>
        </section>

        {/* Manage Existing Variants */}
        {variants.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-[#E8D8C8] rounded-2xl p-4 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">{v.name}</h3>
                <p className="text-xs text-[#7A5C48]">{v.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSoldOut(v)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    v.isSoldOut
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {v.isSoldOut ? 'Sold Out' : 'Available'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteVariant(v.id)}
                  className="px-3 py-2 rounded-xl text-xs bg-stone-100 text-stone-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Swap Image URL */}
            <div className="flex gap-2">
              <input
                type="url"
                defaultValue={v.imageUrl}
                onBlur={(e) => updateImage(v.id, e.target.value)}
                placeholder="Image URL"
                className="flex-1 border border-[#E0CEBC] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* Edit Package Prices */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#7A5C48]">
                Package Prices (IDR — auto-saves on blur):
              </span>
              {v.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="text-[#2C1E16]">
                    {pkg.sizeLabel} — {pkg.name}
                  </span>
                  <input
                    type="number"
                    defaultValue={pkg.price}
                    onBlur={(e) => updatePrice(pkg.id, e.target.value)}
                    className="w-28 border border-[#E0CEBC] rounded-lg px-2.5 py-1.5 text-right font-semibold"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}