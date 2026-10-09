import assert from "node:assert/strict";
import { test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MaybeRTF,
  VisualEditorProvider,
  getDefaultRTF,
  resolveComponentData,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";
import { I18nextProvider } from "react-i18next";
import { createInstance } from "i18next";
import { BoutiqueHospitalityBanner } from "../src/library/sections/BoutiqueHospitalityBanner";
import { BoutiqueHospitalityAboutHotel } from "../src/library/sections/BoutiqueHospitalityAboutHotel";
import { BoutiqueHospitalitySpecialEvents } from "../src/library/sections/BoutiqueHospitalitySpecialEvents";
import { BoutiqueHospitalityHero } from "../src/library/sections/BoutiqueHospitalityHero";
import {
  defaultTextStyles,
  getTextStyle,
  renderRichText,
  resolveRichTextStyles,
  resolveTextColor,
} from "../src/library/shared/sectionStyles";

const color = (selectedColor: string): ThemeColor => ({
  selectedColor,
  contrastingColor: "default",
});
const selectedStyles: StyledTextValue = {
  fontFamily: "Georgia",
  fontSize: "32px",
  fontWeight: "700",
  fontStyle: "italic",
  textTransform: "uppercase",
  color: color("palette-secondary"),
};
const i18n = createInstance();
await i18n.init({ lng: "en", resources: { en: { translation: {} } } });
const puck = {
  isEditing: false,
  dragRef: () => {},
  renderDropZone: () => <></>,
  metadata: {},
};
const renderSection = (content: React.ReactNode) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <VisualEditorProvider
        templateProps={{ document: { name: "Test Hotel", locale: "en" } }}
      >
        {content}
      </VisualEditorProvider>
    </I18nextProvider>,
  );
const assertRichTextStyles = (html: string) => {
  for (const declaration of [
    "--fontFamily-body-fontFamily:Georgia",
    "--fontSize-body-fontSize:32px",
    "--fontWeight-body-fontWeight:700",
    "--fontStyle-body-fontStyle:italic",
    "--textTransform-body-textTransform:uppercase",
    "color:var(--colors-palette-secondary)",
  ]) {
    assert.ok(html.includes(declaration), declaration);
  }
};

test("Text Styles color supports selection, section contrast, and theme defaults", async (t) => {
  for (const { name, selected, expected } of [
    { name: "selected color", selected: "palette-primary", expected: "palette-primary" },
    { name: "default color", selected: "default", expected: "palette-quaternary" },
    { name: "no color", selected: undefined, expected: "palette-quaternary" },
  ]) {
    await t.test(name, () => {
      const styles = {
        ...defaultTextStyles,
        color: selected ? color(selected) : undefined,
      };
      assert.equal(resolveTextColor(styles, "palette-quaternary")?.selectedColor, expected);
      assert.equal(
        getTextStyle(resolveRichTextStyles(styles, "palette-quaternary")).color,
        `var(--colors-${expected})`,
      );
    });
  }
  assert.equal(resolveTextColor(defaultTextStyles, "default"), undefined);
  assert.equal(resolveTextColor(defaultTextStyles), undefined);
});

test("raw and resolved rich text retain formatting and selected typography", async (t) => {
  const data = {
    html: "<h3>Title</h3><p>Paragraph <strong>bold</strong> <em>italic</em></p><ul><li>List item</li></ul>",
  };
  for (const [name, content] of [
    ["raw rich text", data],
    ["resolved rich text", <MaybeRTF data={data} />],
    ["HTML string", data.html],
  ] as const) {
    await t.test(name, () => {
      const rendered = renderRichText(content, selectedStyles, "custom-body");
      assert.ok(React.isValidElement<{ className?: string }>(rendered));
      assert.ok(!rendered.props.className?.split(/\s+/).includes("components"));
      const html = renderToStaticMarkup(rendered);
      assertRichTextStyles(html);
      assert.ok(html.includes(data.html), "Rich text markup is preserved");
      assert.ok(html.includes("custom-body"));
    });
  }
});

test("resolved default rich text receives selected size, weight, and transform", () => {
  const data = getDefaultRTF("Banner Text");
  const resolved = resolveComponentData(
    { field: "", constantValue: { defaultValue: data }, constantValueEnabled: true },
    "en",
    {},
  );
  assertRichTextStyles(renderToStaticMarkup(renderRichText(resolved, selectedStyles)));
});

test("resetting Text Styles inherits theme typography and preserves plain text", () => {
  const html = renderToStaticMarkup(renderRichText({ html: "<p>Default</p>" }, defaultTextStyles));
  assert.ok(!html.includes("--fontSize-body-fontSize"));
  assert.ok(!html.includes("font-size:default"));
  assert.ok(renderToStaticMarkup(renderRichText("Plain text", defaultTextStyles)).includes("Plain text"));
  assert.equal(renderToStaticMarkup(renderRichText(undefined, defaultTextStyles)), "");
});

test("Banner applies Text Styles to the rich text returned by the resolver", () => {
  const props = structuredClone(BoutiqueHospitalityBanner.defaultProps!);
  props.data.styles = selectedStyles;
  const html = renderSection(<BoutiqueHospitalityBanner.render {...props} id="banner" puck={puck} />);
  assertRichTextStyles(html);
  assert.ok(html.includes("Banner Text"));
});

test("About heading and body apply their independent Text Styles", () => {
  const props = structuredClone(BoutiqueHospitalityAboutHotel.defaultProps!);
  props.heading.styles = selectedStyles;
  props.body.styles = selectedStyles;
  const html = renderSection(<BoutiqueHospitalityAboutHotel.render {...props} id="about" puck={puck} />);
  assert.match(html, /<h2 style="[^"]*font-family:Georgia[^"]*font-size:32px[^"]*font-weight:700[^"]*text-transform:uppercase/);
  assertRichTextStyles(html);
});

test("Events body applies Text Styles to resolved rich text", () => {
  const props = structuredClone(BoutiqueHospitalitySpecialEvents.defaultProps!);
  props.body.styles = selectedStyles;
  const html = renderSection(<BoutiqueHospitalitySpecialEvents.render {...props} id="events" puck={puck} />);
  assertRichTextStyles(html);
});

test("Hero brand and description honor Text Styles without flattening inline formatting", () => {
  const props = structuredClone(BoutiqueHospitalityHero.defaultProps!);
  props.brandLine.styles = selectedStyles;
  props.description.styles = selectedStyles;
  props.description.text = {
    field: "",
    constantValue: { defaultValue: { html: "<p>Stay <strong>bold</strong> <em>relaxed</em></p>" } },
    constantValueEnabled: true,
  };
  const html = renderSection(<BoutiqueHospitalityHero.render {...props} id="hero" puck={puck} />);
  assert.match(html, /class="ybh-hero-title-brand" style="[^"]*font-family:Georgia[^"]*font-size:32px[^"]*font-weight:700/);
  assertRichTextStyles(html);
  assert.ok(html.includes("<strong>bold</strong> <em>relaxed</em>"));
  assert.ok(!html.includes("font-weight: inherit !important"));
});
