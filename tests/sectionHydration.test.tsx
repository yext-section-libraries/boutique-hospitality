import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import { createInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { VisualEditorProvider } from "@yext/visual-editor";
import { BoutiqueHospitalityHero } from "../src/library/sections/BoutiqueHospitalityHero";
import { BoutiqueHospitalityFooter } from "../src/library/sections/BoutiqueHospitalityFooter";
import { BoutiqueHospitalityInfoPanels } from "../src/library/sections/BoutiqueHospitalityInfoPanels";
import { BoutiqueHospitalityResortAmenities } from "../src/library/sections/BoutiqueHospitalityResortAmenities";
import { BoutiqueHospitalitySpecialEvents } from "../src/library/sections/BoutiqueHospitalitySpecialEvents";

test("section styles survive server rendering, HTML parsing, and hydration", async (t) => {
  const sections = ["Footer", "Hero", "InfoPanels", "ResortAmenities", "SpecialEvents"];
  const source = sections.map((section) => readFileSync(new URL(
    `../src/library/sections/BoutiqueHospitality${section}.tsx`, import.meta.url,
  ), "utf8")).join("\n");
  const { css } = await postcss([tailwindcss({
    content: [{ raw: source, extension: "tsx" }],
    corePlugins: { preflight: false },
  })]).process("@tailwind utilities;", { from: undefined });
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
    url: "http://localhost/",
  });
  const globals = {
    window: dom.window,
    document: dom.window.document,
    navigator: dom.window.navigator,
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  const previousGlobals = Object.keys(globals).map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ] as const);
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  const sharedStyles = dom.window.document.createElement("style");
  sharedStyles.textContent = css;
  dom.window.document.head.append(sharedStyles);

  try {
    const { hydrateRoot } = await import("react-dom/client");
    const i18n = createInstance();
    await i18n.init({ lng: "en", resources: { en: { translation: {} } } });
    const puck = {
      isEditing: false,
      dragRef: () => {},
      renderDropZone: () => <></>,
      metadata: {},
    };
    const hero = (fontFamily: string, surfaceColor = "palette-primary", id = "hero") => {
      const props = structuredClone(BoutiqueHospitalityHero.defaultProps!);
      props.placeLine.styles.fontFamily = fontFamily;
      props.section.backgroundColor.selectedColor = surfaceColor;
      return <BoutiqueHospitalityHero.render {...props} id={id} puck={puck} />;
    };
    const provider = (children: React.ReactNode) => (
      <I18nextProvider i18n={i18n}>
        <VisualEditorProvider templateProps={{ document: { name: "Test Hotel", locale: "en" } }}>
          {children}
        </VisualEditorProvider>
      </I18nextProvider>
    );
    const assertComponentStyles = (container: HTMLElement) => {
      const styles = [...container.querySelectorAll("style")];
      assert.ok(styles.length > 0, "The section includes its component stylesheet");
      for (const style of styles) {
        assert.doesNotMatch(style.textContent ?? "", /&(?:quot|gt|lt|amp|#\d+|#x[\da-f]+);/i);
        assert.ok(style.sheet?.cssRules.length, "The HTML parser produced valid CSS rules");
      }
    };
    const utilityDeclarations = (
      element: Element,
      property: string,
      options: { media?: string; pseudo?: string } = {},
    ) => {
      const values: string[] = [];
      const visit = (rules: CSSRuleList, media: string[] = []) => {
        for (const rule of rules) {
          if ("selectorText" in rule) {
            const styleRule = rule as CSSStyleRule;
            let selector = styleRule.selectorText;
            if (options.pseudo) {
              if (!selector.endsWith(options.pseudo)) continue;
              selector = selector.slice(0, -options.pseudo.length);
            } else if (selector.includes("::")) {
              continue;
            }
            const matchesMedia = options.media ? media.includes(options.media) : media.length === 0;
            if (matchesMedia && element.matches(selector)) {
              const value = styleRule.style.getPropertyValue(property);
              if (value) values.push(value);
            }
          }
          if ("cssRules" in rule) {
            const conditions = "media" in rule ? [...media, (rule as CSSMediaRule).media.mediaText] : media;
            visit((rule as CSSGroupingRule).cssRules, conditions);
          }
        }
      };
      visit(sharedStyles.sheet!.cssRules);
      return values;
    };
    const cases = [
      {
        name: "control reproduces the original inline CSS hydration mismatch",
        element: <style>{'.title { font-family: "Fraunces", serif; }'}</style>,
        expectMismatch: true,
        verify: (container: HTMLElement) => {
          assert.ok(container.querySelector("style")?.textContent?.includes("&quot;Fraunces&quot;"));
        },
      },
      {
        name: "Hero default font fallback and component CSS survive HTML parsing",
        element: provider(hero("default")),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          const shell = container.querySelector<HTMLElement>(".ybh-hero-shell")!;
          assert.match(shell.style.getPropertyValue("--ybh-hero-place-line-font-family"), /^var\(--fontFamily-h1-fontFamily,\s*(?:"Fraunces"|Fraunces),\s*serif\)$/);
          const ctas = container.querySelector(".ybh-hero-ctas")!;
          assert.ok(ctas.children.length > 0);
          for (const child of ctas.children) {
            assert.ok(utilityDeclarations(child, "width", { media: "(max-width: 1023px)" }).includes("100%"));
          }
          for (const cta of container.querySelectorAll(".ybh-hero-cta")) {
            assert.ok(utilityDeclarations(cta, "width", { media: "(max-width: 1023px)" }).includes("100%"));
          }
        },
      },
      {
        name: "custom font text stays inside the style attribute and cannot create HTML",
        element: provider(hero('"</style><script>alert(1)</script>"')),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          assert.equal(container.querySelector("script"), null);
          const shell = container.querySelector<HTMLElement>(".ybh-hero-shell")!;
          assert.equal(shell.style.getPropertyValue("--ybh-hero-place-line-font-family"), '"</style><script>alert(1)</script>"');
        },
      },
      {
        name: "two Hero instances retain independent colors and fonts",
        element: provider(<>{hero('"First Family"', "palette-primary", "first")}{hero('"Second Family"', "palette-secondary", "second")}</>),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          const [first, second] = container.querySelectorAll<HTMLElement>(".ybh-hero-shell");
          assert.equal(first.style.getPropertyValue("--ybh-hero-overlay-background"), "var(--colors-palette-primary)");
          assert.equal(second.style.getPropertyValue("--ybh-hero-overlay-background"), "var(--colors-palette-secondary)");
          assert.equal(first.style.getPropertyValue("--ybh-hero-place-line-font-family"), '"First Family"');
          assert.equal(second.style.getPropertyValue("--ybh-hero-place-line-font-family"), '"Second Family"');
        },
      },
      {
        name: "Footer child selectors remain usable without escaped stylesheet text",
        element: provider(<BoutiqueHospitalityFooter.render {...structuredClone(BoutiqueHospitalityFooter.defaultProps!)} id="footer" puck={puck} />),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          const label = container.querySelector<HTMLElement>(".ybh-footer-link > span:first-child")!;
          assert.ok(label, "The footer exposes its link label to the child selector");
          assert.equal(dom.window.getComputedStyle(label).overflowWrap, "anywhere");
        },
      },
      {
        name: "Info Panels preserve mobile grid areas and image wrapper heights",
        element: provider(<BoutiqueHospitalityInfoPanels.render {...structuredClone(BoutiqueHospitalityInfoPanels.defaultProps!)} id="info" puck={puck} />),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          assert.ok(container.querySelector(".ybh-info-panel-image"));
          assert.ok(container.querySelector(".ybh-info-panel-card"));
          const shell = container.querySelector<HTMLElement>(".ybh-info-shell")!;
          assert.equal(shell.style.getPropertyValue("--ybh-info-mobile-grid-areas"), '"image" "card"');
          for (const panel of container.querySelectorAll(".ybh-info-panel")) {
            assert.ok(utilityDeclarations(panel, "grid-template-areas", { media: "(max-width: 899px)" }).includes("var(--ybh-info-mobile-grid-areas)"));
            assert.deepEqual(utilityDeclarations(panel, "grid-template-areas"), []);
          }
          const imageWrapper = container.querySelector(".ybh-info-panel-media > div")!;
          assert.ok(imageWrapper);
          assert.ok(utilityDeclarations(imageWrapper, "height").includes("100%"));
        },
      },
      {
        name: "Amenities preserve generated overlay content and child stacking",
        element: provider(<BoutiqueHospitalityResortAmenities.render {...structuredClone(BoutiqueHospitalityResortAmenities.defaultProps!)} id="amenities" puck={puck} />),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          const overlay = container.querySelector(".ybh-amenities-card-overlay")!;
          assert.ok(overlay);
          assert.ok(utilityDeclarations(overlay, "--tw-content", { pseudo: "::before" }).includes("var(--ybh-amenities-overlay-content)"));
          assert.ok(utilityDeclarations(overlay, "content", { pseudo: "::before" }).includes("var(--tw-content)"));
          const shell = container.querySelector<HTMLElement>(".ybh-amenities-shell")!;
          assert.equal(shell.style.getPropertyValue("--ybh-amenities-overlay-content"), '""');
          for (const child of overlay.children) {
            assert.ok(utilityDeclarations(child, "position").includes("relative"));
            assert.ok(utilityDeclarations(child, "z-index").includes("1"));
          }
        },
      },
      {
        name: "Special Events preserve generated overlays and mobile grid areas",
        element: provider(<BoutiqueHospitalitySpecialEvents.render {...structuredClone(BoutiqueHospitalitySpecialEvents.defaultProps!)} id="events" puck={puck} />),
        expectMismatch: false,
        verify: (container: HTMLElement) => {
          assertComponentStyles(container);
          assert.ok(container.querySelector(".ybh-events-media"));
          assert.ok(container.querySelector(".ybh-events-copy"));
          const media = container.querySelector(".ybh-events-media")!;
          assert.ok(utilityDeclarations(media, "--tw-content", { pseudo: "::before" }).includes("var(--ybh-events-overlay-content)"));
          assert.ok(utilityDeclarations(media, "content", { pseudo: "::before" }).includes("var(--tw-content)"));
          const shell = container.querySelector<HTMLElement>(".ybh-events-shell")!;
          assert.equal(shell.style.getPropertyValue("--ybh-events-overlay-content"), '""');
          assert.equal(shell.style.getPropertyValue("--ybh-events-mobile-grid-areas"), '"media" "copy"');
          const panel = container.querySelector(".ybh-events-panel")!;
          assert.ok(utilityDeclarations(panel, "grid-template-areas", { media: "(max-width: 899px)" }).includes("var(--ybh-events-mobile-grid-areas)"));
          assert.deepEqual(utilityDeclarations(panel, "grid-template-areas"), []);
        },
      },
    ];
    for (const { name, element, expectMismatch, verify } of cases) {
      await t.test(name, async () => {
        const container = dom.window.document.getElementById("root")!;
        const errors: string[] = [];
        const originalError = console.error;
        console.error = (...args) => { errors.push(args.map(String).join(" ")); };
        let root: ReturnType<typeof hydrateRoot> | undefined;
        try {
          container.innerHTML = renderToString(element);
          verify(container);
          errors.length = 0;
          await React.act(async () => {
            root = hydrateRoot(container, element, {
              onRecoverableError: (error) => errors.push(String(error)),
            });
          });
          if (expectMismatch) {
            assert.ok(errors.some((error) => error.includes("Text content does not match server-rendered HTML")));
          } else {
            assert.deepEqual(errors, []);
          }
        } finally {
          if (root) await React.act(async () => root?.unmount());
          console.error = originalError;
        }
      });
    }
  } finally {
    for (const [name, descriptor] of previousGlobals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
    dom.window.close();
  }
});
