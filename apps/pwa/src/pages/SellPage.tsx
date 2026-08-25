import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Brand, Category, ListingType, VehicleImage } from "@car-marketplace/types";
import { ETHIOPIA_CITIES, ETHIOPIA_REGIONS } from "@car-marketplace/utils";
import { api } from "../api";
import { PageHeader } from "../components/BackButton";
import { useAuthStore } from "../store";
import { mediaUrl } from "../lib/vehicle";

const YEARS = Array.from(
  { length: 2026 - 2000 + 1 },
  (_, i) => 2026 - i
);

export function SellPage() {
  const navigate = useNavigate();
  const { accessToken, user } = useAuthStore();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    listingTypeId: "",
    brandId: "",
    categoryId: "",
    title: "",
    year: new Date().getFullYear(),
    price: "",
    mileage: "0",
    fuel: "PETROL",
    transmission: "AUTOMATIC",
    region: "Addis Ababa",
    city: "Addis Ababa",
    description: "",
    images: [] as VehicleImage[],
    mainImage: "",
  });

  const selectedType = listingTypes.find((t) => t._id === form.listingTypeId);
  const condition = selectedType?.defaultCondition ?? "USED";

  useEffect(() => {
    if (!accessToken) {
      navigate("/profile", { replace: true });
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    Promise.all([
      api.getBrands(),
      api.getCategories(),
      api.getListingTypes().catch(() => ({ data: [] as ListingType[] })),
    ])
      .then(([b, c, t]) => {
        setBrands(b.data ?? []);
        setCategories(c.data ?? []);
        const types = t.data ?? [];
        setListingTypes(types);
        setForm((f) => ({
          ...f,
          listingTypeId: f.listingTypeId || types[0]?._id || "",
          categoryId: f.categoryId || c.data?.[0]?._id || "",
        }));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load form")
      );
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFiles(files: FileList | null) {
    if (!files || !accessToken) return;
    setError("");
    setUploading(true);
    try {
      const incoming = Array.from(files);
      let images = form.images;
      for (const file of incoming) {
        if (images.length >= 12) break;
        const uploaded = await api.uploadImage(file, accessToken);
        const img = uploaded.data;
        const isFirst = images.length === 0;
        images = [
          ...images,
          {
            url: img.url,
            thumbnailUrl: img.thumbnailUrl,
            publicId: img.publicId,
            secureUrl: img.secureUrl,
            width: img.width,
            height: img.height,
            format: img.format,
            bytes: img.bytes,
            type: isFirst ? "MAIN" : "ADDITIONAL",
            order: images.length,
            isMain: isFirst,
          },
        ];
      }
      setForm((f) => ({
        ...f,
        images,
        mainImage: images[0]?.url ?? f.mainImage,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((f) => {
      const images = f.images.filter((_, i) => i !== index).map((img, order) => ({
        ...img,
        order,
        isMain: order === 0,
        type: (order === 0 ? "MAIN" : "ADDITIONAL") as VehicleImage["type"],
      }));
      return { ...f, images, mainImage: images[0]?.url ?? "" };
    });
  }

  async function submit() {
    if (!accessToken) {
      navigate("/profile");
      return;
    }
    if (!form.listingTypeId) return setError("Please select User Car or New Car.");
    if (!form.brandId) return setError("Please select a brand.");
    if (!form.categoryId) return setError("Please select a category.");
    if (form.title.trim().length < 3) return setError("Enter the model name.");
    if (!form.price || Number(form.price) <= 0) return setError("Enter a price in ETB.");
    if (!form.mainImage) return setError("Please add at least one photo.");

    const brandName = brands.find((b) => b._id === form.brandId)?.name ?? "";
    const typeName = selectedType?.name ?? "car";
    const description =
      form.description.trim().length >= 20
        ? form.description.trim()
        : `${form.year} ${brandName} ${form.title.trim()} listed as ${typeName} in ${form.city}, Ethiopia.`;

    setSaving(true);
    setError("");
    try {
      await api.createVehicle(
        {
          brandId: form.brandId,
          categoryId: form.categoryId,
          listingTypeId: form.listingTypeId,
          title: form.title.trim(),
          condition,
          year: Number(form.year),
          price: Number(form.price),
          negotiable: true,
          mileage: Number(form.mileage || 0),
          fuel: form.fuel,
          transmission: form.transmission,
          description,
          location: {
            country: "Ethiopia",
            region: form.region,
            city: form.city,
          },
          mainImage: form.mainImage,
          images: form.images,
          submit: true,
        },
        accessToken
      );
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit listing");
    } finally {
      setSaving(false);
    }
  }

  if (!accessToken || !user) return null;

  if (done) {
    return (
      <div className="screen">
        <PageHeader title="Sell Your Car" subtitle="Listing submitted." />
        <div className="auth-panel">
          <h2 className="profile-name">Sent for approval</h2>
          <p className="subtitle">
            Your post is now pending. It will appear on the app and website after
            an admin approves it.
          </p>
          <button type="button" className="btn" onClick={() => navigate("/profile")}>
            View my listings
          </button>
          <button type="button" className="btn-outline" onClick={() => navigate("/")}>
            Back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <PageHeader
        title="Sell Your Car"
        subtitle="List your car in minutes. Same data as the website."
      />

      <label className="photo-box">
        {form.mainImage ? (
          <img src={mediaUrl(form.mainImage, "card") || form.mainImage} alt="" />
        ) : (
          <span>{uploading ? "Uploading…" : "Add photos (up to 12)"}</span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
          multiple
          hidden
          disabled={uploading || form.images.length >= 12}
          onChange={(e) => {
            void onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      {form.images.length > 0 ? (
        <div className="photo-thumbs">
          {form.images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              className={`photo-thumb${img.isMain ? " main" : ""}`}
              onClick={() => removeImage(i)}
            >
              <img src={mediaUrl(img.thumbnailUrl ?? img.url, "thumb") || img.url} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      <label className="field-label">
        Listing type
        <select
          className="input"
          value={form.listingTypeId}
          onChange={(e) => {
            const next = listingTypes.find((t) => t._id === e.target.value);
            setForm((f) => ({
              ...f,
              listingTypeId: e.target.value,
              mileage: next?.defaultCondition === "NEW" ? "0" : f.mileage,
            }));
          }}
        >
          <option value="">Select type</option>
          {listingTypes.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Brand
        <select
          className="input"
          value={form.brandId}
          onChange={(e) => update("brandId", e.target.value)}
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Model
        <input
          className="input"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Enter model"
        />
      </label>

      <label className="field-label">
        Category
        <select
          className="input"
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Year
        <select
          className="input"
          value={form.year}
          onChange={(e) => update("year", Number(e.target.value))}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Price (ETB)
        <input
          className="input"
          type="number"
          min={0}
          inputMode="numeric"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          placeholder="Enter price"
        />
      </label>

      <label className="field-label">
        Mileage (KM)
        <input
          className="input"
          type="number"
          min={0}
          inputMode="numeric"
          value={form.mileage}
          onChange={(e) => update("mileage", e.target.value)}
        />
      </label>

      <div className="form-grid">
        <label className="field-label">
          Fuel
          <select
            className="input"
            value={form.fuel}
            onChange={(e) => update("fuel", e.target.value)}
          >
            <option value="PETROL">Petrol</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ELECTRIC">Electric</option>
          </select>
        </label>
        <label className="field-label">
          Transmission
          <select
            className="input"
            value={form.transmission}
            onChange={(e) => update("transmission", e.target.value)}
          >
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
            <option value="CVT">CVT</option>
          </select>
        </label>
      </div>

      <label className="field-label">
        Region
        <select
          className="input"
          value={form.region}
          onChange={(e) => update("region", e.target.value)}
        >
          {ETHIOPIA_REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        City
        <select
          className="input"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
        >
          {ETHIOPIA_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Description
        <textarea
          className="input textarea"
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional — we will add a short description if empty"
        />
      </label>

      {error ? <p className="error">{error}</p> : null}
      <button type="button" className="btn" disabled={saving || uploading} onClick={() => void submit()}>
        {saving ? "Submitting…" : "Continue"}
      </button>
      <p className="form-hint">Your listing goes to pending until an admin approves it.</p>
    </div>
  );
}
