import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Brand, Category, Vehicle } from "@car-marketplace/types";
import { api } from "../api";
import { ChevronRight } from "lucide-react";
import { MotoraHeader } from "../components/MotoraHeader";
import { SearchBar } from "../components/SearchBar";
import { EmptyState, HomeSkeletons } from "../components/EmptyState";
import {
  BrandScroller,
  CompactVehicleCard,
  FeaturedVehicleCard,
  VehicleCard,
} from "../components/VehicleCard";

export function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState<Vehicle[]>([]);
  const [newest, setNewest] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
    ])
      .then(([f, n, c, b]) => {
        setFeatured(f.data);
        setNewest(n.data);
        setCategories(c.data);
        setBrands(b.data.slice(0, 8));
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
  const featuredList = featured.slice(heroVehicle ? 1 : 0);

  return (
    <div className="screen">
      <MotoraHeader />
      <div className="search-wrap">
        <SearchBar value={q} onChange={setQ} />
        <div className="hscroll">
          {[
            { label: "Brand", to: "/search" },
            { label: "Price", to: "/search?sort=price_asc" },
            { label: "Year", to: "/search?sort=newest" },
            { label: "More Filters", to: "/search" },
          ].map((f) => (
            <button key={f.label} type="button" className="chip" onClick={() => navigate(f.to)}>
              {f.label}
            </button>
          ))}
        </div>
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
          {categories.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h2>Categories</h2>
                <button type="button" className="see-all" onClick={() => navigate("/search")}>
                  See all
                  <ChevronRight size={14} strokeWidth={2.4} />
                </button>
              </div>
              <div className="hscroll">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    className="chip"
                    onClick={() =>
                      navigate(`/search?category=${encodeURIComponent(cat.slug)}`)
                    }
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {heroVehicle ? (
            <section className="section">
              <div className="section-head">
                <h2>Featured Cars</h2>
                <button
                  type="button"
                  className="see-all"
                  onClick={() => navigate("/search?sort=featured")}
                >
                  See all
                  <ChevronRight size={14} strokeWidth={2.4} />
                </button>
              </div>
              <FeaturedVehicleCard vehicle={heroVehicle} />
              <div className="featured-stack">
                {featuredList.map((v) => (
                  <VehicleCard key={v._id} vehicle={v} />
                ))}
              </div>
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
                  <ChevronRight size={14} strokeWidth={2.4} />
                </button>
              </div>
              <div className="hscroll">
                {newest.map((v) => (
                  <CompactVehicleCard key={v._id} vehicle={v} />
                ))}
              </div>
            </section>
          ) : null}

          {brands.length > 0 ? (
            <section className="section">
              <div className="section-head">
                <h2>Popular Brands</h2>
                <button type="button" className="see-all" onClick={() => navigate("/search")}>
                  See all
                  <ChevronRight size={14} strokeWidth={2.4} />
                </button>
              </div>
              <BrandScroller brands={brands} />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
