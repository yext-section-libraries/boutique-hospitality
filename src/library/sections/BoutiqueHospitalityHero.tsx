import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  normalizeThemeColorToken,
  resolveComponentData,
  ThemeColor,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import { createCta } from "../shared/createCta";
import { aspectRatioOptions } from "../shared/fieldOptions";

type StyledTextProps = {
  text: YextEntityField<string>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type HeroImageProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
};

type ReviewItem = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
};

type BoutiqueHospitalityHeroDocument = {
  locale?: string;
  ref_reviewsAgg?: {
    publisher?: string;
    topReviews?: ReviewItem[];
  }[];
};

type BoutiqueHospitalityHeroProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  availabilityBadge: StyledTextProps;
  brandLine: StyledTextProps;
  placeLine: StyledTextProps;
  description: StyledRtfProps;
  heroImage: HeroImageProps;
  primaryCta: ComprehensiveCTAValue;
  secondaryCta: ComprehensiveCTAValue;
};

const HeroFields: YextFields<BoutiqueHospitalityHeroProps> = {
  section: {
    label: "Section",
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: "Visible on Live Page",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      backgroundColor: {
        label: "Background Color",
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  availabilityBadge: {
    label: "Availability Badge",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  brandLine: {
    label: "Brand Line",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  placeLine: {
    label: "Place Line",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  description: {
    label: "Description",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.rich_text_v2"] },
      },
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  heroImage: {
    label: "Hero Image",
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: "Image",
        filter: { types: ["type.image"] },
      },
      aspectRatio: {
        label: "Aspect Ratio",
        type: "basicSelector",
        options: aspectRatioOptions,
      },
      imageConstrain: {
        label: "Image Constrain",
        type: "select",
        options: [
          { label: "Fixed", value: "fixed" },
          { label: "Filled", value: "filled" },
        ],
      },
    },
  },
  primaryCta: {
    label: "Primary Call to Action",
    type: "comprehensiveCTA",
  },
  secondaryCta: {
    label: "Secondary Call to Action",
    type: "comprehensiveCTA",
  },
};

const BoutiqueHospitalityHeroComponent: PuckComponent<
  BoutiqueHospitalityHeroProps
> = ({
  id,
  availabilityBadge,
  brandLine,
  placeLine,
  description,
  heroImage,
  primaryCta,
  secondaryCta,
  section,
  puck,
}) => {
  const streamDocument = useDocument<BoutiqueHospitalityHeroDocument>();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeroImage = resolveComponentData(
    heroImage.image,
    locale,
    streamDocument,
  );
  const resolvedBrandLine =
    resolveComponentData(brandLine.text, locale, streamDocument) || "";
  const resolvedPlaceLine =
    resolveComponentData(placeLine.text, locale, streamDocument) || "";
  const resolvedBadge =
    resolveComponentData(availabilityBadge.text, locale, streamDocument) || "";
  const resolvedDescription = resolveComponentData(
    description.text,
    locale,
    streamDocument,
  );
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find(
    (aggregate) => aggregate.publisher === "FIRSTPARTY",
  );
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const sectionSurfaceStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const overlayBackground = getThemeColorCssValue(section.backgroundColor);
  const shellForeground = getThemeColorCssValue(
    getDefaultForegroundColor(section.backgroundColor, streamDocument),
  );
  const availabilityBadgeColor =
    normalizeThemeColorToken(availabilityBadge.fontColor) === "default"
      ? shellForeground
      : (getThemeColorCssValue(availabilityBadge.fontColor) ?? shellForeground);
  const brandLineColor =
    normalizeThemeColorToken(brandLine.fontColor) === "default"
      ? shellForeground
      : (getThemeColorCssValue(brandLine.fontColor) ?? shellForeground);
  const availabilityBadgeTextStyle: React.CSSProperties = {
    fontFamily:
      availabilityBadge.styles.fontFamily === "default"
        ? 'var(--fontFamily-button-fontFamily, "Inter", sans-serif)'
        : availabilityBadge.styles.fontFamily,
    fontSize:
      availabilityBadge.styles.fontSize === "default"
        ? "0.82rem"
        : availabilityBadge.styles.fontSize,
    fontWeight:
      availabilityBadge.styles.fontWeight === "default"
        ? 600
        : availabilityBadge.styles.fontWeight,
    fontStyle:
      availabilityBadge.styles.fontStyle === "default"
        ? "normal"
        : availabilityBadge.styles.fontStyle,
    textTransform:
      availabilityBadge.styles.textTransform === "default"
        ? "uppercase"
        : availabilityBadge.styles.textTransform,
    letterSpacing:
      availabilityBadge.styles.textTransform === "default"
        ? "0.04em"
        : undefined,
    color: availabilityBadgeColor,
  };
  const placeLineColor =
    getThemeColorCssValue(placeLine.fontColor) ?? shellForeground;
  const placeLineFontFamily =
    placeLine.styles.fontFamily === "default"
      ? 'var(--fontFamily-h1-fontFamily, "Fraunces", serif)'
      : placeLine.styles.fontFamily;
  const placeLineFontSize =
    placeLine.styles.fontSize === "default"
      ? "clamp(2.6rem, 5vw, 4.25rem)"
      : placeLine.styles.fontSize;
  const placeLineFontWeight =
    placeLine.styles.fontWeight === "default"
      ? undefined
      : placeLine.styles.fontWeight;
  const placeLineFontStyle =
    placeLine.styles.fontStyle === "default"
      ? "normal"
      : placeLine.styles.fontStyle;
  const placeLineTextTransform =
    placeLine.styles.textTransform === "default"
      ? undefined
      : placeLine.styles.textTransform;
  const placeLineTextStyle: React.CSSProperties = {
    fontFamily: placeLineFontFamily,
    fontSize: placeLineFontSize,
    fontWeight: placeLineFontWeight,
    fontStyle: placeLineFontStyle,
    textTransform: placeLineTextTransform,
    color: placeLineColor,
  };
  const descriptionColor =
    getThemeColorCssValue(description.fontColor) ?? shellForeground;
  const descriptionFontFamily =
    description.styles.fontFamily === "default"
      ? 'var(--fontFamily-body-fontFamily, "Inter", sans-serif)'
      : description.styles.fontFamily;
  const descriptionFontSize =
    description.styles.fontSize === "default"
      ? "1rem"
      : description.styles.fontSize;
  const descriptionFontWeight =
    description.styles.fontWeight === "default"
      ? undefined
      : description.styles.fontWeight;
  const descriptionFontStyle =
    description.styles.fontStyle === "default"
      ? undefined
      : description.styles.fontStyle;
  const descriptionTextTransform =
    description.styles.textTransform === "default"
      ? undefined
      : description.styles.textTransform;
  const descriptionTextStyle: React.CSSProperties = {
    color: descriptionColor,
    fontFamily: descriptionFontFamily,
    fontSize: descriptionFontSize,
    fontWeight: descriptionFontWeight,
    fontStyle: descriptionFontStyle,
    textTransform: descriptionTextTransform,
  };
  const descriptionContent = React.isValidElement(resolvedDescription)
    ? resolvedDescription
    : (resolvedDescription ?? null);
  const heroImageUrl: string | undefined =
    resolvedHeroImage && typeof resolvedHeroImage === "object"
      ? "url" in resolvedHeroImage && typeof resolvedHeroImage.url === "string"
        ? resolvedHeroImage.url
        : "image" in resolvedHeroImage &&
            resolvedHeroImage.image &&
            typeof resolvedHeroImage.image === "object" &&
            "url" in resolvedHeroImage.image &&
            typeof resolvedHeroImage.image.url === "string"
          ? resolvedHeroImage.image.url
          : undefined
      : undefined;
  const imageWrapperStyle: React.CSSProperties = {
    aspectRatio: heroImage.aspectRatio > 0 ? heroImage.aspectRatio : undefined,
    overflow: heroImage.imageConstrain === "filled" ? "hidden" : undefined,
  };

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityHero${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            .ybh-hero-shell {
              position: relative;
              overflow: hidden;
              border-bottom: 1px solid currentColor;
              background: ${overlayBackground};
            }
            .ybh-hero-grid {
              display: grid;
              grid-template-columns: 1fr;
              min-height: 720px;
              position: relative;
              isolation: isolate;
            }
            .ybh-hero-overlay {
              position: absolute;
              inset: 0;
              z-index: 1;
              background: linear-gradient(
                90deg,
                ${overlayBackground} 0%,
                ${overlayBackground} 55%,
                transparent 100%
              );
            }
            .ybh-hero-copy {
              position: relative;
              z-index: 2;
              padding: 56px 20px 40px;
              display: flex;
              align-items: flex-end;
            }
            .ybh-hero-copy-inner {
              max-width: 1200px;
              width: 100%;
              margin: 0 auto;
            }
            .ybh-hero-copy-card {
              max-width: 520px;
              display: flex;
              flex-direction: column;
              gap: 18px;
            }
            .ybh-hero-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              padding: 8px 14px;
              border-radius: 999px;
              background: transparent;
            }
            .ybh-hero-title {
              margin: 0;
              display: flex;
              flex-direction: column;
              gap: 6px;
              color: ${shellForeground};
            }
            .ybh-hero-title-brand {
              color: ${brandLineColor};
              font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
              font-size: clamp(1.4rem, 2vw, 2.1rem);
            }
            .ybh-hero-title-place {
              color: ${placeLineColor};
              font-family: ${placeLineFontFamily};
              font-size: ${placeLineFontSize};
              font-weight: ${placeLineFontWeight ?? "inherit"};
              font-style: ${placeLineFontStyle};
              text-transform: ${placeLineTextTransform ?? "none"};
              line-height: 0.95;
            }
            .ybh-hero-description {
              color: ${descriptionColor};
              font-family: ${descriptionFontFamily};
              font-size: ${descriptionFontSize};
              font-weight: ${descriptionFontWeight ?? "inherit"};
              font-style: ${descriptionFontStyle ?? "normal"};
              text-transform: ${descriptionTextTransform ?? "none"};
              line-height: 1.75;
              max-width: 46ch;
            }
            .ybh-hero-description .MaybeRTF,
            .ybh-hero-description .MaybeRTF *,
            .ybh-hero-description .rtf-theme,
            .ybh-hero-description .rtf-theme * {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              font-style: inherit !important;
              text-transform: inherit !important;
            }
            .ybh-hero-rating {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              align-items: center;
              color: ${shellForeground};
              font-family: var(--fontFamily-body-fontFamily, "Inter", sans-serif);
              font-size: 0.92rem;
            }
            .ybh-hero-stars {
              color: var(--colors-palette-primary);
              letter-spacing: 0.12em;
            }
            .ybh-hero-ctas {
              display: flex;
              flex-wrap: wrap;
              gap: 12px;
            }
            .ybh-hero-cta {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 12px 24px;
              min-height: 48px;
              box-sizing: border-box;
            }
            .ybh-hero-media {
              display: flex;
              min-height: 320px;
              position: relative;
              z-index: 0;
              justify-content: flex-end;
            }
            .ybh-hero-media-frame {
              width: 100%;
              height: 100%;
              position: relative;
              overflow: hidden;
            }
            .ybh-hero-media-frame img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
            @media (max-width: 1023px) {
              .ybh-hero-grid {
                display: flex;
                flex-direction: column;
                min-height: auto;
              }
              .ybh-hero-overlay {
                background: linear-gradient(
                  180deg,
                  ${overlayBackground} 0%,
                  ${overlayBackground} 45%,
                  transparent 100%
                );
              }
              .ybh-hero-copy {
                padding-top: 40px;
                width: 100%;
                order: 0;
              }
              .ybh-hero-media {
                min-height: 0;
                max-height: 200px;
                width: 100%;
                justify-content: stretch;
                order: -1;
              }
              .ybh-hero-media-frame {
                width: 100%;
                min-height: 0;
                max-height: 200px;
              }
              .ybh-hero-media-frame img {
                object-fit: cover;
                object-position: center center;
              }
              .ybh-hero-ctas {
                flex-direction: column;
                align-items: stretch;
              }
              .ybh-hero-ctas > *,
              .ybh-hero-cta {
                width: 100%;
              }
              .ybh-hero-copy {
                padding: 24px 20px 40px;
              }
            }
            @media (min-width: 1024px) {
              .ybh-hero-grid {
                grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
              }
              .ybh-hero-copy {
                padding: 72px 20px 72px 56px;
              }
              .ybh-hero-copy-inner {
                margin-left: auto;
                margin-right: 0;
              }
              .ybh-hero-media {
                min-height: 720px;
              }
            }
          `}</style>
        <Background
          as="section"
          className="ybh-hero-shell"
          background={section.backgroundColor}
          style={sectionSurfaceStyle}
        >
          <div className="ybh-hero-grid">
            <div className="ybh-hero-overlay" aria-hidden />
            <div className="ybh-hero-copy">
              <div className="ybh-hero-copy-inner">
                <div className="ybh-hero-copy-card">
                  <EntityField
                    displayName="Availability Badge"
                    fieldId={availabilityBadge.text.field}
                    constantValueEnabled={
                      availabilityBadge.text.constantValueEnabled
                    }
                  >
                    <span
                      className="ybh-hero-badge"
                      style={availabilityBadgeTextStyle}
                    >
                      {resolvedBadge}
                    </span>
                  </EntityField>
                  <h1 className="ybh-hero-title">
                    <EntityField
                      displayName="Brand Line"
                      fieldId={brandLine.text.field}
                      constantValueEnabled={brandLine.text.constantValueEnabled}
                    >
                      <span className="ybh-hero-title-brand">
                        {resolvedBrandLine}
                      </span>
                    </EntityField>
                    <EntityField
                      displayName="Place Line"
                      fieldId={placeLine.text.field}
                      constantValueEnabled={placeLine.text.constantValueEnabled}
                    >
                      <span
                        className="ybh-hero-title-place"
                        style={placeLineTextStyle}
                      >
                        {resolvedPlaceLine}
                      </span>
                    </EntityField>
                  </h1>
                  <EntityField
                    displayName="Description"
                    fieldId={description.text.field}
                    constantValueEnabled={description.text.constantValueEnabled}
                  >
                    <div
                      className="ybh-hero-description"
                      style={descriptionTextStyle}
                    >
                      {descriptionContent}
                    </div>
                  </EntityField>
                  {reviews.length ? (
                    <div className="ybh-hero-rating">
                      <span>
                        {averageRating?.toFixed?.(1) ?? averageRating} Stars
                      </span>
                      <span className="ybh-hero-stars">★★★★★</span>
                      <span>
                        {reviewCount.toLocaleString(locale)} guest reviews
                      </span>
                    </div>
                  ) : null}
                  <div className="ybh-hero-ctas">
                    <EntityField
                      displayName="Primary Call to Action"
                      fieldId={primaryCta.data.cta.field}
                      constantValueEnabled={
                        primaryCta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={{
                          data: primaryCta.data,
                          styles: primaryCta.styles,
                        }}
                        className="ybh-hero-cta"
                        eventName="heroPrimaryCta"
                      />
                    </EntityField>
                    <EntityField
                      displayName="Secondary Call to Action"
                      fieldId={secondaryCta.data.cta.field}
                      constantValueEnabled={
                        secondaryCta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={{
                          data: secondaryCta.data,
                          styles: secondaryCta.styles,
                        }}
                        className="ybh-hero-cta"
                        eventName="heroSecondaryCta"
                      />
                    </EntityField>
                  </div>
                </div>
              </div>
            </div>
            <div className="ybh-hero-media">
              <EntityField
                displayName="Hero Image"
                fieldId={heroImage.image.field}
                constantValueEnabled={heroImage.image.constantValueEnabled}
              >
                <div className="ybh-hero-media-frame" style={imageWrapperStyle}>
                  {heroImageUrl ? (
                    <img src={heroImageUrl} alt="" loading="lazy" />
                  ) : null}
                </div>
              </EntityField>
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityHero: YextComponentConfig<BoutiqueHospitalityHeroProps> =
  {
    label: "Hero",
    fields: HeroFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      availabilityBadge: {
        text: {
          field: "",
          constantValue: "Rooms Available for Booking",
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      brandLine: {
        text: {
          field: "geomodifier",
          constantValue: "",
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
          isDarkColor: false,
        },
      },
      placeLine: {
        text: {
          field: "name",
          constantValue: "",
          constantValueEnabled: false,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      description: {
        text: {
          field: "",
          constantValue: {
            hasLocalizedValue: "true",
            defaultValue: getDefaultRTF(
              "[[name]] - [[address.city]] is a luxury boutique hotel offering a curated blend of historic Southern charm, modern amenities, and sophisticated comfort. Experience personalized concierge services, a chef-driven culinary program, and an unmatched location in the heart of the Historic District.",
            ),
          },
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      heroImage: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1.2,
        imageConstrain: "filled",
      },
      primaryCta: createCta({
        label: "Book A Room",
        variant: "primary",
        color: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
          isDarkColor: false,
        },
      }),
      secondaryCta: createCta({
        label: "Explore Special Offers",
        variant: "secondary",
      }),
    },
    render: BoutiqueHospitalityHeroComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityHero",
  displayName: "Hero",
  description: "Hero",
  pageSetTypes: ["ENTITY"],
};
