import * as React from "react";
import {
  MaybeRTF,
  getDefaultForegroundColor,
  getThemeColorCssValue,
  type MaybeRTFProps,
  type RichText,
  type StreamDocument,
  type StyledTextValue,
  type ThemeColor,
} from "@yext/visual-editor";

export const hasExplicitThemeColor = (
  color?: ThemeColor,
): color is ThemeColor =>
  Boolean(color?.selectedColor && color.selectedColor !== "default");

export const getReadableForegroundColor = (
  surfaceColor: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): ThemeColor =>
  getDefaultForegroundColor(surfaceColor, streamDocument) ?? {
    selectedColor: surfaceColor.contrastingColor || "black",
    contrastingColor: surfaceColor.selectedColor,
  };

export const resolveTextColor = (
  fontColor: ThemeColor | undefined,
  surfaceColor: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): string | undefined => {
  const color = hasExplicitThemeColor(fontColor)
    ? fontColor
    : getReadableForegroundColor(surfaceColor, streamDocument);
  return getThemeColorCssValue(color.selectedColor);
};

export const getTextStyle = (
  styles: StyledTextValue,
  fontColor?: ThemeColor,
  surfaceColor?: ThemeColor,
  streamDocument?: StreamDocument | Record<string, unknown>,
): React.CSSProperties => ({
  color: surfaceColor
    ? resolveTextColor(fontColor, surfaceColor, streamDocument)
    : getThemeColorCssValue(fontColor),
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

export const renderRichText = (
  value: unknown,
  richTextStyleOverrides?: MaybeRTFProps["richTextStyleOverrides"],
  containerProps?: React.HTMLAttributes<HTMLDivElement>,
): React.ReactNode => {
  if (React.isValidElement(value)) {
    const elementStyle = richTextStyleOverrides
      ? {
          ...richTextStyleOverrides,
          color:
            typeof richTextStyleOverrides.color === "object"
              ? getThemeColorCssValue(richTextStyleOverrides.color)
              : richTextStyleOverrides.color,
        }
      : undefined;
    const element = elementStyle
      ? React.cloneElement(
          value as React.ReactElement<{ style?: React.CSSProperties }>,
          {
            style: {
              ...(value.props as { style?: React.CSSProperties }).style,
              ...(elementStyle as React.CSSProperties),
            },
          },
        )
      : value;
    return containerProps ? <div {...containerProps}>{element}</div> : element;
  }

  const data =
    typeof value === "string" ||
    (typeof value === "object" && value !== null && "html" in value)
      ? (value as RichText | string)
      : undefined;
  return (
    <MaybeRTF
      {...containerProps}
      data={data}
      richTextStyleOverrides={richTextStyleOverrides}
    />
  );
};
