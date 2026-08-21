"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-brand-charcoal text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link href="/" className="font-display text-2xl font-bold">
            Drive<span className="text-accent-muted">ET</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            {t("footer.explore")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/cars" className="hover:text-white">
                {t("footer.browseCars")}
              </Link>
            </li>
            <li>
              <Link href="/dealers" className="hover:text-white">
                {t("nav.dealers")}
              </Link>
            </li>
            <li>
              <Link href="/cars?condition=NEW" className="hover:text-white">
                {t("footer.newVehicles")}
              </Link>
            </li>
            <li>
              <Link href="/cars?condition=USED" className="hover:text-white">
                {t("footer.usedVehicles")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            {t("footer.sellers")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/sell" className="hover:text-white">
                {t("footer.sellYourCar")}
              </Link>
            </li>
            <li>
              <Link href="/seller" className="hover:text-white">
                {t("footer.sellerDashboard")}
              </Link>
            </li>
            <li>
              <Link href="/register?role=DEALER" className="hover:text-white">
                {t("footer.becomeDealer")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            {t("footer.support")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-gray-400">
            <li>
              <Link href="/login" className="hover:text-white">
                {t("nav.signIn")}
              </Link>
            </li>
            <li>
              <a href="mailto:hello@driveet.et" className="hover:text-white">
                {t("footer.contact")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-gray-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} DriveET. {t("footer.rights")}
          </p>
          <p>{t("footer.currency")}</p>
        </div>
      </div>
    </footer>
  );
}
