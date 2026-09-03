import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  MaybeRTF,
  resolveComponentData,
  ThemeColor,
  ThemeOptions,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type RichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ImageFieldProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
};

type AccommodationItemFields = {
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: {
    label: YextEntityField<TranslatableString>;
    link: YextEntityField<TranslatableString>;
    openInNewTab: boolean;
  };
};

type AccommodationStyles = {
  title: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  description: {
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  cta: ComprehensiveCTAValue["styles"];
};

const accommodationsSource = createItemSource<AccommodationItemFields>({
  label: "Accommodation Items",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      label: "CTA",
      type: "object",
      objectFields: {
        label: {
          type: "entityField",
          label: "Label",
          filter: { types: ["type.string"] },
        },
        link: {
          type: "entityField",
          label: "Link",
          filter: { types: ["type.string"] },
        },
        openInNewTab: {
          label: "Open in New Tab",
          type: "radio",
          options: [
            { label: "Yes", value: true },
            { label: "No", value: false },
          ],
        },
      },
    },
  },
  defaultValues: [
    {
      title: {
        field: "",
        constantValue: "Deluxe King Room",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "A spacious, light-filled room featuring a plush king-size bed, a dedicated workspace, and a spa-inspired marble bathroom.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Check Availability",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
    {
      title: {
        field: "",
        constantValue: "Executive Double Queen",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Perfect for families or small groups, offering two queen-size beds, a comfortable seating area, and luxury bath amenities.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Check Availability",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
    {
      title: {
        field: "",
        constantValue: "The [[name]] King Suite",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Our signature penthouse suite featuring a separate living area, a private balcony, and elevated downtown views.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Check Availability",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
  ],
});

type BoutiqueHospitalityFeaturedAccommodationsProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    listSurfaceBackgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  description: StyledRtfProps;
  image: ImageFieldProps;
  items: {
    data: typeof accommodationsSource.value;
    styles: AccommodationStyles;
  };
};

const getStyledTextCss = (
  styles: StyledTextValue,
  color?: string,
): React.CSSProperties => ({
  margin: 0,
  color,
  fontFamily: styles.fontFamily === "default" ? undefined : styles.fontFamily,
  fontSize: styles.fontSize === "default" ? undefined : styles.fontSize,
  fontWeight: styles.fontWeight === "default" ? undefined : styles.fontWeight,
  fontStyle: styles.fontStyle === "default" ? undefined : styles.fontStyle,
  textTransform:
    styles.textTransform === "default" ? undefined : styles.textTransform,
});

const renderResolvedRichText = (
  value: unknown,
  props?: React.HTMLAttributes<HTMLDivElement>,
) =>
  React.isValidElement(value) ? (
    <div {...props}>{value}</div>
  ) : (
    <MaybeRTF
      {...props}
      data={
        typeof value === "string"
          ? value
          : (value as string | RichText | undefined)
      }
    />
  );

const FeaturedFields: YextFields<BoutiqueHospitalityFeaturedAccommodationsProps> =
  {
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
        listSurfaceBackgroundColor: {
          label: "List Surface Background Color",
          type: "basicSelector",
          options: "BACKGROUND_COLOR",
        },
      },
    },
    heading: {
      label: "Heading",
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
    image: {
      label: "Image",
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
          options: ThemeOptions.ASPECT_RATIO,
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
    items: {
      label: "Items",
      type: "object",
      objectFields: {
        data: {
          ...accommodationsSource.field,
          label: "Data",
        },
        styles: {
          label: "Styles",
          type: "object",
          objectFields: {
            title: {
              label: "Title",
              type: "object",
              objectFields: {
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
                styles: { label: "Text Styles", type: "styledText" },
                fontColor: {
                  label: "Font Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
              },
            },
            cta: {
              label: "CTA",
              type: "object",
              objectFields: {
                variant: {
                  label: "Variant",
                  type: "radio",
                  options: [
                    { label: "Primary", value: "primary" },
                    { label: "Secondary", value: "secondary" },
                    { label: "Link", value: "link" },
                  ],
                },
                color: {
                  label: "Color",
                  type: "basicSelector",
                  options: "SITE_COLOR",
                },
                button: { label: "Button Styles", type: "styledButton" },
                link: { label: "Link Styles", type: "styledLink" },
              },
            },
          },
        },
      },
    },
  };

const BoutiqueHospitalityFeaturedAccommodationsComponent: PuckComponent<
  BoutiqueHospitalityFeaturedAccommodationsProps
> = ({ id, heading, description, image, items, section, puck }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedDescription =
    resolveComponentData(description.text, locale, streamDocument) || "";
  const resolvedImage = resolveComponentData(
    image.image,
    locale,
    streamDocument,
  );
  const hasImage = Boolean(
    resolvedImage &&
    ((resolvedImage as { url?: string }).url ||
      (resolvedImage as { image?: { url?: string } }).image?.url),
  );
  const resolvedItems = accommodationsSource.resolveItems(
    items.data,
    streamDocument,
  );
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const descriptionColor =
    getThemeColorCssValue(description.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const listTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(
      section.listSurfaceBackgroundColor,
      streamDocument,
    ),
  );

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityFeaturedAccommodations${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            .ybh-featured-shell {
              padding: 40px 20px;
            }
            .ybh-featured-track {
              max-width: 1200px;
              margin: 0 auto;
            }
          .ybh-featured-heading {
            display: flex;
            align-items: center;
            gap: 28px;
            margin-bottom: 24px;
          }
          .ybh-featured-line {
            width: 28px;
            height: 2px;
            background: var(--colors-palette-primary);
            flex-shrink: 0;
          }
          .ybh-featured-heading-copy {
            display: flex;
            align-items: center;
            gap: 24px;
            min-width: 0;
          }
          .ybh-featured-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
          }
          .ybh-featured-heading-description {
            margin: 0;
            min-width: 0;
            max-width: 48rem;
          }
          .ybh-featured-heading-description .MaybeRTF,
          .ybh-featured-heading-description .MaybeRTF *,
          .ybh-featured-item-description .MaybeRTF,
          .ybh-featured-item-description .MaybeRTF * {
            color: inherit;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            font-style: inherit;
            text-transform: inherit;
            line-height: inherit;
          }
          .ybh-featured-heading-description .MaybeRTF p,
          .ybh-featured-item-description .MaybeRTF p {
            margin: 0;
          }
          .ybh-featured-grid {
            display: grid;
            gap: 24px;
            align-items: stretch;
          }
          .ybh-featured-grid--no-image {
            grid-template-columns: 1fr;
          }
          .ybh-featured-image {
            width: 100%;
          }
            .ybh-featured-items {
              border: 1px solid currentColor;
              padding: 18px 20px;
            }
            .ybh-featured-item {
              padding: 18px 0;
              border-top: 1px solid currentColor;
            }
            .ybh-featured-item:first-child {
              border-top: 0;
              padding-top: 0;
            }
            .ybh-featured-item:last-child {
              padding-bottom: 0;
            }
            .ybh-featured-cta {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 12px 24px;
              min-height: 48px;
              box-sizing: border-box;
              margin-top: 12px;
            }
            @media (min-width: 900px) {
              .ybh-featured-grid {
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
              }
              .ybh-featured-grid--no-image {
                grid-template-columns: 1fr;
              }
            }
            @media (max-width: 899px) {
              .ybh-featured-heading {
                align-items: center;
                gap: 14px;
              }
              .ybh-featured-heading-copy {
                width: 100%;
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
              }
              .ybh-featured-heading-text {
                max-width: 100%;
                font-size: clamp(1.9rem, 8vw, 2.6rem);
              }
              .ybh-featured-heading-description {
                max-width: 100%;
              }
              .ybh-featured-image {
                max-height: 450px;
                overflow: hidden;
              }
              .ybh-featured-image img {
                object-fit: cover !important;
                object-position: center center;
              }
            }
          `}</style>
        <Background
          as="section"
          className="ybh-featured-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-featured-track">
            <div className="ybh-featured-heading">
              <span className="ybh-featured-line" aria-hidden />
              <div className="ybh-featured-heading-copy">
                <EntityField
                  displayName="Heading"
                  fieldId={heading.text.field}
                  constantValueEnabled={heading.text.constantValueEnabled}
                >
                  <h2
                    className="ybh-featured-heading-text"
                    style={getStyledTextCss(heading.styles, headingColor)}
                  >
                    {resolvedHeading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Description"
                  fieldId={description.text.field}
                  constantValueEnabled={description.text.constantValueEnabled}
                >
                  <div
                    className="ybh-featured-heading-description"
                    style={getStyledTextCss(
                      description.styles,
                      descriptionColor,
                    )}
                  >
                    {renderResolvedRichText(resolvedDescription, {
                      className: "ybh-featured-heading-description-rtf",
                    })}
                  </div>
                </EntityField>
              </div>
            </div>
            <div
              className={`ybh-featured-grid${hasImage ? "" : " ybh-featured-grid--no-image"}`}
            >
              {hasImage ? (
                <EntityField
                  displayName="Image"
                  fieldId={image.image.field}
                  constantValueEnabled={image.image.constantValueEnabled}
                >
                  <div className="ybh-featured-image">
                    <Image
                      image={
                        resolvedImage as
                          ImageType | ComplexImageType | TranslatableAssetImage
                      }
                      style={{
                        width: "100%",
                        aspectRatio:
                          image.aspectRatio > 0
                            ? `${image.aspectRatio}`
                            : undefined,
                        objectFit:
                          image.imageConstrain === "filled"
                            ? "cover"
                            : "contain",
                      }}
                    />
                  </div>
                </EntityField>
              ) : null}
              <EntityField
                displayName="Accommodation Items"
                fieldId={items.data.field}
                constantValueEnabled={items.data.constantValueEnabled}
              >
                <Background
                  className="ybh-featured-items"
                  background={section.listSurfaceBackgroundColor}
                  style={getSurfaceColorStyle(
                    section.listSurfaceBackgroundColor,
                    streamDocument,
                  )}
                >
                  {resolvedItems.map((item, index) => {
                    const itemTitleText =
                      resolveComponentData(item.title, locale, streamDocument, {
                        output: "plainText",
                      }) || "";
                    const ctaLabel =
                      resolveComponentData(
                        item.cta?.label,
                        locale,
                        streamDocument,
                        {
                          output: "plainText",
                        },
                      ) || "";
                    const ctaLink =
                      resolveComponentData(
                        item.cta?.link,
                        locale,
                        streamDocument,
                        {
                          output: "plainText",
                        },
                      ) || "#";
                    const itemTitleColor =
                      getThemeColorCssValue(items.styles.title.fontColor) ??
                      listTextColor;
                    const itemDescriptionColor =
                      getThemeColorCssValue(
                        items.styles.description.fontColor,
                      ) ?? listTextColor;
                    const itemDescriptionRichTextStyleOverrides = {
                      ...items.styles.description.styles,
                      color: itemDescriptionColor,
                    };
                    const itemDescription = item.description
                      ? resolveComponentData(
                          item.description,
                          locale,
                          streamDocument,
                          {
                            richTextStyleOverrides:
                              itemDescriptionRichTextStyleOverrides,
                          },
                        )
                      : undefined;
                    return (
                      <article
                        key={`${itemTitleText}-${index}`}
                        className="ybh-featured-item"
                      >
                        <h3
                          style={{
                            margin: 0,
                            color: itemTitleColor,
                            fontFamily:
                              items.styles.title.styles.fontFamily === "default"
                                ? undefined
                                : items.styles.title.styles.fontFamily,
                            fontSize:
                              items.styles.title.styles.fontSize === "default"
                                ? undefined
                                : items.styles.title.styles.fontSize,
                            fontWeight:
                              items.styles.title.styles.fontWeight === "default"
                                ? undefined
                                : items.styles.title.styles.fontWeight,
                            fontStyle:
                              items.styles.title.styles.fontStyle === "default"
                                ? undefined
                                : items.styles.title.styles.fontStyle,
                            textTransform:
                              items.styles.title.styles.textTransform ===
                              "default"
                                ? undefined
                                : items.styles.title.styles.textTransform,
                          }}
                        >
                          {itemTitleText}
                        </h3>
                        <div
                          className="ybh-featured-item-description"
                          style={{
                            ...getStyledTextCss(
                              items.styles.description.styles,
                              itemDescriptionColor,
                            ),
                            marginTop: "10px",
                          }}
                        >
                          {renderResolvedRichText(itemDescription, {
                            className: "ybh-featured-item-description-rtf",
                          })}
                        </div>
                        <ComprehensiveCTA
                          value={{
                            data: {
                              actionType: "link",
                              cta: {
                                field: "",
                                constantValue: {
                                  label: ctaLabel,
                                  link: ctaLink,
                                  linkType: "URL",
                                  ctaType: "textAndLink",
                                },
                                constantValueEnabled: true,
                                selectedType: "textAndLink",
                              },
                              openInNewTab: item.cta?.openInNewTab,
                            },
                            styles: items.styles.cta,
                          }}
                          className="ybh-featured-cta"
                          eventName={`featuredAccommodationCta${index}`}
                        />
                      </article>
                    );
                  })}
                </Background>
              </EntityField>
            </div>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityFeaturedAccommodations: YextComponentConfig<BoutiqueHospitalityFeaturedAccommodationsProps> =
  {
    label: "Featured Accommodations",
    fields: toPuckFields(FeaturedFields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        listSurfaceBackgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: "Featured Accommodations",
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
      description: {
        text: {
          field: "",
          constantValue: {
            hasLocalizedValue: "true",
            defaultValue: getDefaultRTF(
              "Explore our beautifully appointed guest rooms and suites, designed with custom furnishings and plush bedding for ultimate relaxation.",
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
      image: {
        image: {
          field: "",
          constantValue: {
            url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
            width: 1267,
            height: 1900,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "filled",
      },
      items: {
        data: accommodationsSource.defaultValue,
        styles: {
          title: {
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
            styles: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
            fontColor: undefined,
          },
          cta: {
            variant: "secondary",
            button: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
              borderRadius: "default",
              letterSpacing: "default",
            },
            link: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
              letterSpacing: "default",
              includeCaret: "default",
            },
          },
        },
      },
    },
    render: BoutiqueHospitalityFeaturedAccommodationsComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityFeaturedAccommodations",
  displayName: "Featured Accommodations",
  description: "Featured Accommodations",
  pageSetTypes: ["ENTITY"],
};
