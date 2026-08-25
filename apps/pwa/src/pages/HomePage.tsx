import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Brand, Category, ListingType, Vehicle } from "@car-marketplace/types";
import {
  Car,
  Cog,
  PlusCircle,
  Sparkles,
  Wrench,
} from "lucide-react";
import { api } from "../api";
import { DirshayHeader } from "../components/MotoraHeader";
import { SearchBar } from "../components/SearchBar";
import { EmptyState, HomeSkeletons } from "../components/EmptyState";
import { BrandScroller, VehicleCard } from "../components/VehicleCard";
import { VehicleImage } from "../components/VehicleImage";
import { getBrandName } from "../lib/vehicle";

export function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  const [newest, setNewest] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [listingTypes, setListingTypes] = useState<ListingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [loadError, setLoadError] = useState("");

  const loadHome = useCallback(() => {
    setLoading(true);
    setLoadError("");
    Promise.all([
      api.getVehicles({ featured: true, limit: 4 }),
      api.getVehicles({ sort: "newest", limit: 8 }),
      api.getCategories(),
      api.getBrands(),
      api.getListingTypes().catch(() => ({ data: [] as ListingType[] })),
    ])
      .then(([f, n, c, b, t]) => {
        setFeatured(f.data);
        setNewest(n.data);
        setCategories(c.data);
        setBrands(b.data.slice(0, 8));
        setListingTypes(t.data ?? []);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : "Could not load cars");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const heroVehicle = featured[0];

  return (
    <div className="screen">
      <DirshayHeader showBack={false} />
      <div className="search-wrap">
        <SearchBar value={q} onChange={setQ} />
      </div>

      {loading ? (
        <HomeSkeletons />
      ) : loadError ? (
        <EmptyState
          title="Could not load cars"
          description={loadError}
          actionLabel="Try again"
          onAction={loadHome}
        />
      ) : (
        <>
          {heroVehicle ? (
            <article
              className="hero-banner"
              style={{ marginTop: 18 }}
              onClick={() => navigate(`/vehicle/${heroVehicle.slug}`)}
            >
              <VehicleImage uri={heroVehicle.mainImage} />
              <div className="hero-copy">
                <h2>Find Your Perfect Car</h2>
                <p className="featured-meta">
                  {getBrandName(heroVehicle)} {heroVehicle.title}
                </p>
              </div>
            </article>
          ) : (
            <div className="hero-banner" style={{ marginTop: 18 }}>
              <div className="hero-copy">
                <h2>Find Your Perfect Car</h2>
              </div>
            </div>
          )}

          <div className="quick-grid">
            <button type="button" className="quick-item" onClick={() => navigate("/search")}>
              <div className="quick-icon">
                <Car size={22} />
              </div>
              <span>All Cars</span>
            </button>
            <button type="button" className="quick-item" onClick={() => navigate("/parts")}>
              <div className="quick-icon">
                <Cog size={22} />
              </div>
              <span>Spare Parts</span>
            </button>
            <button type="button" className="quick-item" onClick={() => navigate("/sell")}>
              <div className="quick-icon">
                <PlusCircle size={22} />
              </div>
              <span>Sell Car</span>
            </button>
            <button type="button" className="quick-item" onClick={() => navigate("/services")}>
              <div className="quick-icon">
                <Wrench size={22} />
              </div>
              <span>Services</span>
            </button>
          </div>

          {listingTypes.length > 0 ? (
            <div className="hscroll sort-row" style={{ marginTop: 8 }}>
              {listingTypes.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  className="chip"
                  onClick={() =>
                    navigate(`/search?listingType=${encodeURIComponent(t.slug)}`)
                  }
                >
                  {t.name}
                </button>
              ))}
            </div>
          ) : null}

          {brands.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h2>Popular Brands</h2>
              </div>
              <BrandScroller brands={brands} />
            </section>
          ) : null}

          {categories.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h2>Browse by Category</h2>
              </div>
              <div className="cat-grid">
                {categories.slice(0, 4).map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    className="cat-card"
                    onClick={() =>
                      navigate(`/search?category=${encodeURIComponent(cat.slug)}`)
                    }
                  >
                    <Sparkles size={18} color="#d71920" />
                    <strong>{cat.name}</strong>
                    <small>
                      {typeof cat.vehicleCount === "number" ? `${cat.vehicleCount} cars` : "Browse"}
                    </small>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {newest.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h2>New Arrivals</h2>
                <button
                  type="button"
                  className="see-all"
                  onClick={() => navigate("/search?sort=newest")}
                >
                  See all
                </button>
              </div>
              {newest.slice(0, 4).map((v) => (
                <VehicleCard key={v._id} vehicle={v} />
              ))}
            </section>
          ) : null}

          {!heroVehicle && featured.length === 0 && newest.length === 0 ? (
            <EmptyState
              title="No cars found"
              description="Try changing your search or filters."
              actionLabel="Clear Filters"
              onAction={() => setQ("")}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
