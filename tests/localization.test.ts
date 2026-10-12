import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { createInstance } from "i18next";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { VisualEditorProvider } from "@yext/visual-editor";
import { BoutiqueHospitalityHero } from "../src/library/sections/BoutiqueHospitalityHero";
import { BoutiqueHospitalityReviews } from "../src/library/sections/BoutiqueHospitalityReviews";
import { ResultsCountSummary } from "../src/library/shared/components/locator/Results";
import {
  calculateDistanceMeters,
  formatDistanceAway,
  formatRating,
  getLocalizedCountOptions,
} from "../src/library/shared/localization";

test("ratings use the locale's decimal separator", () => {
  assert.equal(formatRating(4.5, "en"), "4.5");
  assert.equal(formatRating(4.5, "fr"), "4,5");
  assert.equal(formatRating(4, "de"), "4,0");
});

test("counts use numeric plural selection and localized display with other interpolations", async (t) => {
  for (const locale of ["en", "fr", "de"]) {
    await t.test(locale, async () => {
      const i18n = createInstance();
      await i18n.init({
        lng: locale,
        resources: {
          [locale]: {
            translation: {
              reviews_one: "{{rating}} from {{count}} review",
              reviews_other: "{{rating}} from {{count}} reviews",
            },
          },
        },
      });
      const rating = formatRating(4.5, locale);
      assert.equal(
        i18n.t("reviews", getLocalizedCountOptions(1, locale, { rating })),
        `${rating} from 1 review`,
      );
      assert.equal(
        i18n.t("reviews", getLocalizedCountOptions(12345, locale, { rating })),
        `${rating} from ${new Intl.NumberFormat(locale).format(12345)} reviews`,
      );
    });
  }
});

test("nearby distance handles zero coordinates and missing coordinates", () => {
  assert.equal(
    calculateDistanceMeters(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0 },
    ),
    0,
  );
  const meters = calculateDistanceMeters(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 1 },
  );
  assert.ok(meters !== undefined && Math.abs(meters - 111195) < 1);
  assert.equal(
    calculateDistanceMeters(undefined, { latitude: 0, longitude: 0 }),
    undefined,
  );
  assert.equal(
    calculateDistanceMeters({ latitude: 0 }, { latitude: 0, longitude: 0 }),
    undefined,
  );
});

test("nearby distance uses translated units, locale decimals and appropriate plural", async (t) => {
  for (const { locale, meters, expected } of [
    { locale: "en", meters: 0, expected: "0 miles away" },
    { locale: "en", meters: 1609.344, expected: "1 mile away" },
    { locale: "en", meters: 3218.688, expected: "2 miles away" },
    { locale: "en-GB", meters: 3218.688, expected: "2 miles away" },
    { locale: "de", meters: 1609.344, expected: "1,6 Kilometer entfernt" },
    { locale: "es", meters: 1500, expected: "A 1,5 kilómetros de distancia" },
  ]) {
    await t.test(`${locale}: ${meters}`, async () => {
      const catalog = JSON.parse(
        await readFile(
          new URL(`../src/library/i18n/page/${locale}.json`, import.meta.url),
          "utf8",
        ),
      );
      const i18n = createInstance();
      await i18n.init({
        lng: locale,
        resources: { [locale]: { translation: catalog } },
      });
      assert.equal(formatDistanceAway(meters, locale, i18n.t), expected);
    });
  }
});

test("Hero, Reviews, and locator render localized numbers without losing other interpolations", async (t) => {
  for (const locale of ["en", "fr"]) {
    for (const count of [1, 12345]) {
      await t.test(`${locale}: ${count}`, async () => {
        const catalog = JSON.parse(await readFile(
          new URL(`../src/library/i18n/page/${locale}.json`, import.meta.url),
          "utf8",
        ));
        const i18n = createInstance();
        await i18n.init({ lng: locale, resources: { [locale]: { translation: catalog } } });
        const document = {
          locale,
          name: "Test Hotel",
          ref_reviewsAgg: [{
            publisher: "FIRSTPARTY",
            averageRating: 4.5,
            reviewCount: count,
            topReviews: [{ rating: 4.5, content: "A lovely stay." }],
          }],
        };
        const render = (element: React.ReactNode) => renderToStaticMarkup(
          React.createElement(VisualEditorProvider, { templateProps: { document } },
            React.createElement(I18nextProvider, { i18n }, element)),
        );
        for (const component of [BoutiqueHospitalityHero, BoutiqueHospitalityReviews]) {
          const html = render(React.createElement(component.render, {
            ...structuredClone(component.defaultProps!),
            id: "test",
            puck: { isEditing: false, dragRef: () => {}, metadata: {} },
          }));
          assert.ok(html.includes(new Intl.NumberFormat(locale).format(count)), "localized count");
          assert.ok(html.includes(locale === "fr" ? "4,5" : "4.5"), "localized rating");
          assert.ok(!html.includes("{{"), "all interpolations resolved");
          if (locale === "en" && count === 1) {
            assert.ok(html.includes("1 guest review"));
            assert.ok(!html.includes("1 guest reviews"));
          }
        }
        const locator = render(React.createElement(ResultsCountSummary, {
          resultCount: count,
          searchState: "complete",
          selectedDistanceOption: 1.5,
          filterDisplayName: "Test City",
        }));
        assert.ok(locator.includes(new Intl.NumberFormat(locale).format(count)));
        assert.ok(locator.includes(locale === "fr" ? "1,5" : "1.5"));
        assert.ok(locator.includes("Test City"));
        assert.ok(!locator.includes("{{"));
      });
    }
  }
});
