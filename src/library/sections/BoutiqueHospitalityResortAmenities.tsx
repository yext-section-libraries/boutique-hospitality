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
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  MaybeRTF,
  getDefaultRTF,
  resolveComponentData,
  ThemeColor,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type MaybeRTFProps,
  type StyledTextValue,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";

type AmenityItemFields = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: {
    label: YextEntityField<TranslatableString>;
    link: YextEntityField<TranslatableString>;
    openInNewTab: boolean;
  };
};

type AmenityStyles = {
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

const amenitiesSource = createItemSource<AmenityItemFields>({
  label: "Amenity Items",
  mappingFields: {
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
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
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "The Courtyard Lounge & Bar",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "An intimate bar with cocktails, local craft beers, and a private fire pit for evening conversations.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "View Drink Menu",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
    {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "The Fitness Center",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "A modern space with cardio equipment, free weights, Peloton bikes, and complimentary yoga mats.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "See Equipment",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
    {
      image: {
        field: "",
        constantValue: {
          url: "https://a.mktgcdn.com/p/Qdlacb36DqN5Lt3q6V9jw-qSMmbPyl_AeMEI_CyDkHc/1267x1900.jpg",
          width: 1267,
          height: 1900,
        },
        constantValueEnabled: true,
      },
      title: {
        field: "",
        constantValue: "Rooftop Oasis Pool",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Relax and unwind by our heated outdoor pool, complete with private cabanas, poolside beverage service, and skyline views.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Reserve A Cabana",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
  ],
});

type BoutiqueHospitalityResortAmenitiesProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    overlayBackgroundColor: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  amenities: {
    data: typeof amenitiesSource.value;
    styles: AmenityStyles;
  };
};

const renderResolvedRichText = (
  value: string | React.ReactElement | undefined,
  richTextStyleOverrides: MaybeRTFProps["richTextStyleOverrides"],
) => {
  if (React.isValidElement(value)) {
    return value;
  }
  const data = typeof value === "string" ? value : undefined;
  return (
    <MaybeRTF data={data} richTextStyleOverrides={richTextStyleOverrides} />
  );
};

const AmenitiesFields: YextFields<BoutiqueHospitalityResortAmenitiesProps> =
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
        overlayBackgroundColor: {
          label: "Overlay Background Color",
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
    amenities: {
      label: "Amenities",
      type: "object",
      objectFields: {
        data: {
          ...amenitiesSource.field,
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

const BoutiqueHospitalityResortAmenitiesComponent: PuckComponent<
  BoutiqueHospitalityResortAmenitiesProps
> = ({ id, section, heading, amenities, puck }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedItems = amenitiesSource.resolveItems(
    amenities.data,
    streamDocument,
  );
  const resolvedAmenities: {
    item: (typeof resolvedItems)[number];
    image: ImageType | ComplexImageType | TranslatableAssetImage | undefined;
    hasImage: boolean;
  }[] = resolvedItems.map((item) => {
    const image = item.image;
    return {
      item,
      image,
      hasImage: Boolean(
        image &&
        ((image as { url?: string }).url ||
          (image as { image?: { url?: string } }).image?.url),
      ),
    };
  });
  const resolvedAmenityRows: (typeof resolvedAmenities)[] = [];
  resolvedAmenities.forEach((amenity, index) => {
    const rowIndex = Math.floor(index / 3);
    if (!resolvedAmenityRows[rowIndex]) {
      resolvedAmenityRows[rowIndex] = [];
    }
    resolvedAmenityRows[rowIndex].push(amenity);
  });
  const overlayColor = getThemeColorCssValue(section.overlayBackgroundColor);
  const overlayTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(section.overlayBackgroundColor, streamDocument),
  );
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityResortAmenities${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            .ybh-amenities-shell {
              padding: 40px 20px;
            }
            .ybh-amenities-track {
              max-width: 1200px;
              margin: 0 auto;
            }
          .ybh-amenities-heading {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 28px;
          }
          .ybh-amenities-heading-line {
            width: 28px;
            height: 1px;
            background: var(--colors-palette-primary);
          }
          .ybh-amenities-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
          }
          .ybh-amenities-grid {
            display: grid;
            gap: 20px;
          }
          .ybh-amenities-row {
            display: grid;
            gap: 20px;
          }
          .ybh-amenities-card {
            position: relative;
            overflow: hidden;
            min-height: 500px;
            border: 1px solid currentColor;
            background: ${overlayColor};
          }
          .ybh-amenities-card--no-images {
            min-height: 0;
          }
          .ybh-amenities-card-media {
            position: absolute;
            inset: 0;
            transition: transform 240ms ease;
            will-change: transform;
          }
          .ybh-amenities-card-media .ybh-amenities-card-image,
          .ybh-amenities-card-media .ybh-amenities-card-image img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            display: block;
          }
          .ybh-amenities-card-media .ybh-amenities-card-image img {
            object-fit: cover;
          }
          .ybh-amenities-card-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 14px;
            padding: 28px 24px 24px;
            color: ${overlayTextColor};
            text-align: center;
            background: transparent;
          }
          .ybh-amenities-card-overlay::before {
            content: "";
            position: absolute;
            inset: 0;
            background: ${overlayColor};
            opacity: 0.82;
            pointer-events: none;
          }
          .ybh-amenities-card-overlay > * {
            position: relative;
            z-index: 1;
          }
          .ybh-amenities-card--no-images .ybh-amenities-card-overlay {
            position: relative;
            inset: auto;
            min-height: 0;
            background: ${overlayColor};
          }
          .ybh-amenities-card--no-images .ybh-amenities-card-overlay::before {
            display: none;
          }
          .ybh-amenities-card p {
            margin: 0;
          }
          .ybh-amenities-card:hover .ybh-amenities-card-media {
            transform: scale(1.05);
          }
          .ybh-amenities-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            min-height: 48px;
            box-sizing: border-box;
            text-decoration: none;
          }
          @media (min-width: 900px) {
            .ybh-amenities-row {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          @media (max-width: 899px) {
            .ybh-amenities-heading {
              align-items: flex-start;
            }
            .ybh-amenities-heading-text {
              font-size: clamp(1.9rem, 8vw, 2.6rem);
            }
            .ybh-amenities-grid {
              gap: 16px;
            }
            .ybh-amenities-row {
              gap: 16px;
            }
            .ybh-amenities-card {
              min-height: 500px;
            }
            .ybh-amenities-card--no-images {
              min-height: 0;
            }
            .ybh-amenities-card-overlay {
              padding: 24px 18px 18px;
              gap: 12px;
            }
          }
        `}</style>
        <Background
          as="section"
          className="ybh-amenities-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-amenities-track">
            <div className="ybh-amenities-heading">
              <span className="ybh-amenities-heading-line" aria-hidden />
              <EntityField
                displayName="Heading"
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  className="ybh-amenities-heading-text"
                  style={{
                    margin: 0,
                    color: headingColor,
                    fontFamily:
                      heading.styles.fontFamily === "default"
                        ? undefined
                        : heading.styles.fontFamily,
                    fontSize:
                      heading.styles.fontSize === "default"
                        ? undefined
                        : heading.styles.fontSize,
                    fontWeight:
                      heading.styles.fontWeight === "default"
                        ? undefined
                        : heading.styles.fontWeight,
                    fontStyle:
                      heading.styles.fontStyle === "default"
                        ? undefined
                        : heading.styles.fontStyle,
                    textTransform:
                      heading.styles.textTransform === "default"
                        ? undefined
                        : heading.styles.textTransform,
                  }}
                >
                  {resolvedHeading}
                </h2>
              </EntityField>
            </div>
            <EntityField
              displayName="Amenity Items"
              fieldId={amenities.data.field}
              constantValueEnabled={amenities.data.constantValueEnabled}
            >
              <div className="ybh-amenities-grid">
                {resolvedAmenityRows.map((row, rowIndex) => {
                  const rowHasImages = row.some((amenity) => amenity.hasImage);
                  return (
                    <div
                      className="ybh-amenities-row"
                      key={`amenities-row-${rowIndex}`}
                    >
                      {row.map(({ item, image, hasImage }, index: number) => {
                        const title =
                          resolveComponentData(
                            item.title,
                            locale,
                            streamDocument,
                            { output: "plainText" },
                          ) || "";
                        const ctaLabel =
                          resolveComponentData(
                            item.cta?.label,
                            locale,
                            streamDocument,
                            { output: "plainText" },
                          ) || "";
                        const ctaLink =
                          resolveComponentData(
                            item.cta?.link,
                            locale,
                            streamDocument,
                            { output: "plainText" },
                          ) || "#";
                        const titleColor = getThemeColorCssValue(
                          amenities.styles.title.fontColor,
                        );
                        const descriptionColor = getThemeColorCssValue(
                          amenities.styles.description.fontColor,
                        );
                        const descriptionRichTextStyleOverrides = {
                          ...amenities.styles.description.styles,
                          color: descriptionColor ?? overlayTextColor,
                        };
                        const desc = item.description
                          ? resolveComponentData(
                              item.description,
                              locale,
                              streamDocument,
                              {
                                richTextStyleOverrides:
                                  descriptionRichTextStyleOverrides,
                              },
                            )
                          : undefined;
                        return (
                          <article
                            key={`${title}-${index}`}
                            className={`ybh-amenities-card${rowHasImages ? "" : " ybh-amenities-card--no-images"}`}
                          >
                            {hasImage ? (
                              <div className="ybh-amenities-card-media">
                                <Image
                                  image={
                                    image as
                                      | ImageType
                                      | ComplexImageType
                                      | TranslatableAssetImage
                                  }
                                  className="ybh-amenities-card-image"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            ) : null}
                            <Background
                              className="ybh-amenities-card-overlay"
                              background={section.overlayBackgroundColor}
                            >
                              <h3
                                style={{
                                  margin: 0,
                                  color: titleColor,
                                  fontFamily:
                                    amenities.styles.title.styles.fontFamily ===
                                    "default"
                                      ? undefined
                                      : amenities.styles.title.styles
                                          .fontFamily,
                                  fontSize:
                                    amenities.styles.title.styles.fontSize ===
                                    "default"
                                      ? undefined
                                      : amenities.styles.title.styles.fontSize,
                                  fontWeight:
                                    amenities.styles.title.styles.fontWeight ===
                                    "default"
                                      ? undefined
                                      : amenities.styles.title.styles
                                          .fontWeight,
                                  fontStyle:
                                    amenities.styles.title.styles.fontStyle ===
                                    "default"
                                      ? undefined
                                      : amenities.styles.title.styles.fontStyle,
                                  textTransform:
                                    amenities.styles.title.styles
                                      .textTransform === "default"
                                      ? undefined
                                      : amenities.styles.title.styles
                                          .textTransform,
                                }}
                              >
                                {title}
                              </h3>
                              <div
                                style={{
                                  color: descriptionColor ?? overlayTextColor,
                                }}
                              >
                                {renderResolvedRichText(
                                  desc,
                                  descriptionRichTextStyleOverrides,
                                )}
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
                                  styles: amenities.styles.cta,
                                }}
                                className="ybh-amenities-link"
                                eventName={`amenityCta${index}`}
                              />
                            </Background>
                          </article>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityResortAmenities: YextComponentConfig<BoutiqueHospitalityResortAmenitiesProps> =
  {
    label: "Resort Amenities",
    fields: toPuckFields(AmenitiesFields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        overlayBackgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: "Resort Amenities",
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
      amenities: {
        data: amenitiesSource.defaultValue,
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
            variant: "link",
            color: {
              selectedColor: "palette-primary",
              contrastingColor: "palette-primary-contrast",
              isDarkColor: false,
            },
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
    render: BoutiqueHospitalityResortAmenitiesComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityResortAmenities",
  displayName: "Resort Amenities",
  description: "Resort Amenities",
  pageSetTypes: ["ENTITY"],
};
