import * as React from "react";
import {
  MaybeRTF,
  getThemeColorCssValue,
  normalizeThemeColorToken,
  renderStyledRichText,
  type RichText,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

export const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const isRichText = (value: unknown): value is RichText =>
  Boolean(
    value &&
    typeof value === "object" &&
    (("html" in value && typeof value.html === "string") ||
      ("json" in value && typeof value.json === "string")),
  );

export const renderRichText = (
  value: unknown,
  text: StyledTextValue,
  className?: string,
): React.ReactNode => {
  const content = isRichText(value) ? (
    <MaybeRTF data={value} />
  ) : React.isValidElement(value) || typeof value === "string" ? (
    value
  ) : null;

  const rendered = renderStyledRichText({ content, text, className });
  if (!React.isValidElement<{ className?: string }>(rendered)) {
    return rendered;
  }

  // A new .components scope resets these variables to !important editor theme
  // defaults. Inherit the section's theme so the selected typography can apply.
  return React.cloneElement(rendered, {
    className: rendered.props.className
      ?.split(/\s+/)
      .filter((name) => name !== "components")
      .join(" "),
  });
};

/** Use the selected text color, otherwise the section's contrasting color. */
export const resolveTextColor = (
  styles: Pick<StyledTextValue, "color">,
  fallbackColor?: ThemeColor | string,
): ThemeColor | undefined => {
  if (normalizeThemeColorToken(styles.color)) {
    return styles.color;
  }
  const fallbackToken = normalizeThemeColorToken(fallbackColor);
  return fallbackToken
    ? typeof fallbackColor === "string"
      ? { selectedColor: fallbackToken, contrastingColor: "default" }
      : fallbackColor
    : undefined;
};

export const resolveRichTextStyles = (
  styles: StyledTextValue,
  fallbackColor?: ThemeColor | string,
): StyledTextValue => ({
  ...styles,
  color: resolveTextColor(styles, fallbackColor),
});

export const hasExplicitThemeColor = (color?: ThemeColor): color is ThemeColor =>
  Boolean(color?.selectedColor && color.selectedColor !== "default");

export const getTextStyle = (styles: StyledTextValue): React.CSSProperties => ({
  color: getThemeColorCssValue(resolveTextColor(styles)),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});
