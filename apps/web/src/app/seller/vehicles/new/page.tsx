"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import type { Brand, Category, ImageType, VehicleImage } from "@car-marketplace/types";
import {
  ETHIOPIA_CITIES,
  ETHIOPIA_REGIONS,
  validateImageFile,
} from "@car-marketplace/utils";
import { mediaUrl } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const STEPS = [
  "Basic",
  "Specs",
  "Price",
  "Images",
  "Features",
  "Description",
  "Preview",
];

export default function AddVehiclePage() {
  const router = useRouter();
  const { getValidToken, logout } = useAuthStore();
  const [step, setStep] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    brandId: "",
    categoryId: "",
    title: "",
    condition: "USED",
    year: new Date().getFullYear(),
    mileage: 0,
    fuel: "PETROL",
    transmission: "AUTOMATIC",
    engine: "",
    drive: "FWD",
    color: "",
    bodyType: "",
    price: 0,
    negotiable: true,
    region: "Addis Ababa",
    city: "Addis Ababa",
    mainImage: "",
    images: [] as VehicleImage[],
    description: "",
    features: {
      safety: [] as string[],
      comfort: [] as string[],
      technology: [] as string[],
      exterior: [] as string[],
      interior: [] as string[],
    },
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/brands`).then((r) => r.json()),
      fetch(`${API}/categories`).then((r) => r.json()),
    ]).then(([b, c]) => {
      setBrands(b.data ?? []);
      setCategories(c.data ?? []);
    });
  }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function uploadImage(file: File, imageType = "ADDITIONAL") {
    const check = validateImageFile(file, { maxSizeMB: 10 });
    if (!check.valid) throw new Error(check.error);

    if (form.images.length >= 20) {
      throw new Error("Maximum 20 images per vehicle.");
    }

    setError("");
    setUploading(true);
    try {
      const token = await getValidToken();
      if (!token) {
        logout();
        router.push("/login?redirect=/seller/vehicles/new");
        throw new Error("Session expired. Please sign in again.");
      }

      const body = new FormData();
      body.append("image", file);
      const type = form.images.length === 0 ? "MAIN" : imageType;
      const res = await fetch(
        `${API}/uploads/image?type=${encodeURIComponent(type.toLowerCase())}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      );
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          router.push("/login?redirect=/seller/vehicles/new");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error(json.message || "Upload failed");
      }

      const uploaded = json.data as {
        url: string;
        thumbnailUrl?: string;
        publicId?: string;
        secureUrl?: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
      };

      setForm((f) => {
        const isFirst = f.images.length === 0;
        const next: VehicleImage = {
          url: uploaded.url,
          thumbnailUrl: uploaded.thumbnailUrl,
          publicId: uploaded.publicId,
          secureUrl: uploaded.secureUrl,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          bytes: uploaded.bytes,
          type: isFirst ? "MAIN" : "ADDITIONAL",
          order: f.images.length,
          isMain: isFirst,
        };
        return {
          ...f,
          images: [...f.images, next],
          mainImage: isFirst ? uploaded.url : f.mainImage,
        };
      });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const image = form.images[index];
    if (!image) return;

    const token = await getValidToken();
    if (token && (image.publicId || image.url)) {
      await fetch(`${API}/uploads`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicId: image.publicId, url: image.url }),
      }).catch(() => undefined);
    }

    setForm((f) => {
      const images = f.images.filter((_, i) => i !== index);
      const main =
        images.find((img) => img.isMain) ??
        images[0];
      return {
        ...f,
        images: images.map((img, order) => ({
          ...img,
          order,
          isMain: main ? img.url === main.url : false,
          type: (main && img.url === main.url
            ? "MAIN"
            : img.type === "MAIN"
              ? "ADDITIONAL"
              : img.type) as ImageType,
        })),
        mainImage: main?.url ?? "",
      };
    });
  }

  function setMainImage(index: number) {
    setForm((f) => {
      const images = f.images.map((img, i) => ({
        ...img,
        isMain: i === index,
        type: (i === index
          ? "MAIN"
          : img.type === "MAIN"
            ? "ADDITIONAL"
            : img.type) as ImageType,
      }));
      return {
        ...f,
        images,
        mainImage: images[index]?.url ?? f.mainImage,
      };
    });
  }

  function validateForm(): string | null {
    if (!form.brandId) return "Please select a Brand (step Basic).";
    if (!form.categoryId) return "Please select a Category (step Basic).";
    if (!form.title || form.title.trim().length < 3) {
      return "Model / Title must be at least 3 characters (step Basic).";
    }
    if (!form.price || Number(form.price) <= 0) {
      return "Please enter a price greater than 0 (step Price).";
    }
    if (!form.mainImage) {
      return "Please upload a main image (step Images).";
    }
    if (!form.description || form.description.trim().length < 20) {
      return "Description must be at least 20 characters (step Description).";
    }
    if (!form.region || !form.city) {
      return "Please select region and city (step Price).";
    }
    return null;
  }

  async function submit(asDraft: boolean) {
    const token = await getValidToken();
    if (!token) {
      logout();
      router.push("/login?redirect=/seller/vehicles/new");
      setError("Session expired. Please sign in again.");
      return;
    }

    const localError = validateForm();
    if (localError) {
      setError(localError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brandId: form.brandId,
          categoryId: form.categoryId,
          title: form.title.trim(),
          condition: form.condition,
          year: Number(form.year),
          price: Number(form.price),
          negotiable: form.negotiable,
          mileage: Number(form.mileage),
          fuel: form.fuel,
          transmission: form.transmission,
          engine: form.engine || undefined,
          drive: form.drive || undefined,
          color: form.color || undefined,
          bodyType: form.bodyType || undefined,
          description: form.description.trim(),
          features: form.features,
          location: {
            country: "Ethiopia",
            region: form.region,
            city: form.city,
          },
          mainImage: form.mainImage,
          images:
            form.images.length > 0
              ? form.images
              : [{ url: form.mainImage, type: "MAIN", order: 0, isMain: true }],
          submit: !asDraft,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.errors) {
          const details = Object.entries(
            json.errors as Record<string, string[]>
          )
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
            .join(" · ");
          throw new Error(details || json.message || "Validation failed");
        }
        throw new Error(json.message || "Failed to save");
      }
      router.push("/seller/vehicles");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "mt-1 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm";

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Add Vehicle</h1>
      <p className="mt-1 text-sm text-gray-500">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div className="mt-6 flex gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={
              i === step
                ? "shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs text-white"
                : "shrink-0 rounded-md bg-gray-100 px-3 py-1.5 text-xs text-gray-600"
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 max-w-xl space-y-4 bg-white p-6">
        {step === 0 && (
          <>
            <label className="block text-sm">
              Brand
              <select
                className={selectClass}
                value={form.brandId}
                onChange={(e) => update("brandId", e.target.value)}
                required
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Model / Title
              <Input
                className="mt-1"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Land Cruiser Prado"
              />
            </label>
            <label className="block text-sm">
              Category
              <select
                className={selectClass}
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
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Year
                <Input
                  type="number"
                  className="mt-1"
                  value={form.year}
                  onChange={(e) => update("year", Number(e.target.value))}
                />
              </label>
              <label className="block text-sm">
                Condition
                <select
                  className={selectClass}
                  value={form.condition}
                  onChange={(e) => update("condition", e.target.value)}
                >
                  <option value="NEW">New</option>
                  <option value="USED">Used</option>
                  <option value="CERTIFIED_USED">Certified Used</option>
                </select>
              </label>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className="block text-sm">
              Mileage (KM)
              <Input
                type="number"
                className="mt-1"
                value={form.mileage}
                onChange={(e) => update("mileage", Number(e.target.value))}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Fuel
                <select
                  className={selectClass}
                  value={form.fuel}
                  onChange={(e) => update("fuel", e.target.value)}
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="ELECTRIC">Electric</option>
                </select>
              </label>
              <label className="block text-sm">
                Transmission
                <select
                  className={selectClass}
                  value={form.transmission}
                  onChange={(e) => update("transmission", e.target.value)}
                >
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </label>
            </div>
            <label className="block text-sm">
              Engine
              <Input
                className="mt-1"
                value={form.engine}
                onChange={(e) => update("engine", e.target.value)}
                placeholder="2.8L"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                Color
                <Input
                  className="mt-1"
                  value={form.color}
                  onChange={(e) => update("color", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Body type
                <Input
                  className="mt-1"
                  value={form.bodyType}
                  onChange={(e) => update("bodyType", e.target.value)}
                />
              </label>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block text-sm">
              Price (ETB)
              <Input
                type="number"
                className="mt-1"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.negotiable}
                onChange={(e) => update("negotiable", e.target.checked)}
              />
              Negotiable
            </label>
            <label className="block text-sm">
              Region
              <select
                className={selectClass}
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
            <label className="block text-sm">
              City
              <select
                className={selectClass}
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
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-gray-500">
              Upload vehicle photos. Main image is required. Recommended: at
              least 5 images. Maximum: 20. JPEG, PNG, WebP, or AVIF. 10 MB each.
            </p>

            {form.mainImage && (
              <div className="relative mt-4 aspect-vehicle overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(form.mainImage, "detail")}
                  alt="Main"
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-xs font-medium text-white">
                  Main image
                </span>
              </div>
            )}

            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {form.images.map((img, i) => (
                  <div key={`${img.publicId ?? img.url}-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(img.thumbnailUrl ?? img.url, "thumb")}
                      alt=""
                      className={`aspect-[4/3] w-full object-cover ${
                        img.isMain ? "ring-2 ring-accent" : ""
                      }`}
                    />
                    <div className="mt-1 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setMainImage(i)}
                        className="flex-1 rounded bg-gray-100 px-1 py-1 text-[10px] font-medium hover:bg-gray-200"
                      >
                        {img.isMain ? "Main" : "Set main"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="rounded bg-gray-100 px-2 py-1 text-[10px] text-semantic-error hover:bg-gray-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50 px-4 py-8">
              <span className="text-sm text-gray-500">
                {uploading
                  ? "Uploading…"
                  : form.images.length === 0
                    ? "Click to upload main image"
                    : `Add more images (${form.images.length}/20)`}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                multiple
                className="hidden"
                disabled={uploading || form.images.length >= 20}
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  for (const file of files) {
                    if (form.images.length >= 20) break;
                    try {
                      await uploadImage(file);
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Upload failed"
                      );
                      break;
                    }
                  }
                  e.target.value = "";
                }}
              />
            </label>
            {uploading && (
              <p className="text-sm text-accent">Saving image…</p>
            )}
          </>
        )}

        {step === 4 && (
          <p className="text-sm text-gray-500">
            Features can be refined after listing. Defaults will be applied for
            safety and comfort packages.
          </p>
        )}

        {step === 5 && (
          <label className="block text-sm">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={8}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the vehicle condition, history, and extras…"
              minLength={20}
            />
          </label>
        )}

        {step === 6 && (
          <div className="space-y-2 text-sm">
            <p>
              <strong>
                {brands.find((b) => b._id === form.brandId)?.name || "No brand"}{" "}
                {form.title || "(no model)"}
              </strong>{" "}
              · {form.year} · {form.condition}
            </p>
            <p>
              ETB {Number(form.price || 0).toLocaleString()}
              {!form.price ? (
                <span className="text-semantic-error"> — add a price</span>
              ) : null}
            </p>
            <p>
              {form.city}, {form.region}
            </p>
            <p>
              Images:{" "}
              {form.images.length > 0 ? (
                <span className="text-accent">
                  {form.images.length} uploaded
                  {form.mainImage ? " · main selected" : ""}
                </span>
              ) : (
                <span className="text-semantic-error">Missing</span>
              )}
            </p>
            <p>
              Description:{" "}
              {form.description.trim().length >= 20 ? (
                <span className="text-accent">OK</span>
              ) : (
                <span className="text-semantic-error">
                  Need at least 20 characters
                </span>
              )}
            </p>
            <p className="text-gray-500">
              Submitting will send this listing for admin approval.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-semantic-error">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-4">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => submit(true)}
              >
                Save draft
              </Button>
              <Button
                type="button"
                disabled={saving}
                onClick={() => submit(false)}
              >
                {saving ? "Submitting…" : "Submit for approval"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
