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
  resolveComponentData,
  ThemeColor,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type StyledTextValue,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import { getTextStyle, renderRichText } from "../shared/sectionStyles";

type BlogItemFields = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  title: YextEntityField<TranslatableString>;
  description: YextEntityField<TranslatableRichText>;
  cta: {
    label: YextEntityField<TranslatableString>;
    link: YextEntityField<TranslatableString>;
    openInNewTab: boolean;
  };
};

type BlogCardStyles = {
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

const blogSource = createItemSource<BlogItemFields>({
  label: "Blog Items",
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
        constantValue:
          "48 Hours in [[address.city]]: The Ultimate Weekend Itinerary",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Discover how to make the most of a short trip, from sunrise walks under moss-draped oaks to candlelit southern dinners.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Read Article",
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
        constantValue:
          "Hidden Gems: The Best Boutique Shops And Cafes Near Bull St",
        constantValueEnabled: true,
      },
      description: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Skip the tourist traps. Our local concierge team shares their favorite local boutiques, bookstores, and artisan coffee shops.",
          ),
        },
        constantValueEnabled: true,
      },
      cta: {
        label: {
          field: "",
          constantValue: "Read Article",
          constantValueEnabled: true,
        },
        link: { field: "", constantValue: "#", constantValueEnabled: true },
        openInNewTab: false,
      },
    },
  ],
});

type BoutiqueHospitalityBlogProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    cardBackgroundColor: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  cards: {
    data: typeof blogSource.value;
    styles: BlogCardStyles;
  };
};

const BlogFields: YextFields<BoutiqueHospitalityBlogProps> = {
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
      cardBackgroundColor: {
        label: "Card Background Color",
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
  cards: {
    label: "Cards",
    type: "object",
    objectFields: {
      data: {
        ...blogSource.field,
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

const BoutiqueHospitalityBlogComponent: PuckComponent<
  BoutiqueHospitalityBlogProps
> = ({ id, section, heading, cards, puck }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedItems = blogSource.resolveItems(cards.data, streamDocument);
  const resolvedCards: {
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
  const resolvedCardRows: (typeof resolvedCards)[] = [];
  resolvedCards.forEach((card, index) => {
    const rowIndex = Math.floor(index / 2);
    if (!resolvedCardRows[rowIndex]) {
      resolvedCardRows[rowIndex] = [];
    }
    resolvedCardRows[rowIndex].push(card);
  });
  const sectionTextColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const cardTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(section.cardBackgroundColor, streamDocument),
  );

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityBlog${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-blog-shell {
            padding: 40px 20px;
          }
          .ybh-blog-track {
            max-width: 1200px;
            margin: 0 auto;
          }
          .ybh-blog-heading {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .ybh-blog-line {
            width: 28px;
            height: 1px;
            background: var(--colors-palette-primary);
          }
          .ybh-blog-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
          }
          .ybh-blog-grid {
            display: grid;
            gap: 24px;
          }
          .ybh-blog-row {
            display: grid;
            gap: 24px;
          }
          .ybh-blog-card {
            border: 1px solid currentColor;
            display: flex;
            flex-direction: column;
          }
          .ybh-blog-card--no-images {
            min-height: 0;
          }
          .ybh-blog-card-media {
            aspect-ratio: 1.7;
            width: 100%;
          }
          .ybh-blog-copy {
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            flex: 1;
          }
          .ybh-blog-card-title {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h3-fontFamily, "Fraunces", serif);
            font-size: clamp(1.75rem, 2.4vw, 2.15rem);
            line-height: 1.05;
          }
          .ybh-blog-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            min-height: 48px;
            box-sizing: border-box;
          }
          @media (min-width: 900px) {
            .ybh-blog-row {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
        `}</style>
        <Background
          as="section"
          className="ybh-blog-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-blog-track">
            <div className="ybh-blog-heading">
              <span className="ybh-blog-line" aria-hidden />
              <EntityField
                displayName="Heading"
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  className="ybh-blog-heading-text"
                  style={{
                    ...getTextStyle(heading.styles),
                    color: sectionTextColor,
                  }}
                >
                  {resolvedHeading}
                </h2>
              </EntityField>
            </div>
            <EntityField
              displayName="Blog Items"
              fieldId={cards.data.field}
              constantValueEnabled={cards.data.constantValueEnabled}
            >
              <div className="ybh-blog-grid">
                {resolvedCardRows.map((row, rowIndex) => {
                  const rowHasImages = row.some((card) => card.hasImage);
                  return (
                    <div className="ybh-blog-row" key={`blog-row-${rowIndex}`}>
                      {row.map(({ item, image, hasImage }, index: number) => {
                        const titleText =
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
                        const titleColor =
                          getThemeColorCssValue(cards.styles.title.fontColor) ??
                          cardTextColor;
                        const descriptionColor =
                          getThemeColorCssValue(
                            cards.styles.description.fontColor,
                          ) ?? cardTextColor;
                        const descriptionRichTextStyleOverrides = {
                          ...cards.styles.description.styles,
                          color: descriptionColor,
                        };
                        const descriptionValue = item.description
                          ? resolveComponentData(
                              item.description,
                              locale,
                              streamDocument,
                            )
                          : undefined;
                        return (
                          <Background
                            key={`${titleText}-${index}`}
                            className={`ybh-blog-card${rowHasImages ? "" : " ybh-blog-card--no-images"}`}
                            background={section.cardBackgroundColor}
                            style={getSurfaceColorStyle(
                              section.cardBackgroundColor,
                              streamDocument,
                            )}
                          >
                            {rowHasImages ? (
                              <div className="ybh-blog-card-media">
                                {hasImage && image ? (
                                  <Image
                                    image={image}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : null}
                              </div>
                            ) : null}
                            <div className="ybh-blog-copy">
                              <h3
                                className="ybh-blog-card-title"
                                style={{
                                  color: titleColor,
                                  fontFamily:
                                    cards.styles.title.styles.fontFamily ===
                                    "default"
                                      ? undefined
                                      : cards.styles.title.styles.fontFamily,
                                  fontSize:
                                    cards.styles.title.styles.fontSize ===
                                    "default"
                                      ? undefined
                                      : cards.styles.title.styles.fontSize,
                                  fontWeight:
                                    cards.styles.title.styles.fontWeight ===
                                    "default"
                                      ? undefined
                                      : cards.styles.title.styles.fontWeight,
                                  fontStyle:
                                    cards.styles.title.styles.fontStyle ===
                                    "default"
                                      ? undefined
                                      : cards.styles.title.styles.fontStyle,
                                  textTransform:
                                    cards.styles.title.styles.textTransform ===
                                    "default"
                                      ? undefined
                                      : cards.styles.title.styles.textTransform,
                                }}
                              >
                                {titleText}
                              </h3>
                              <div
                                style={{
                                  margin: 0,
                                  color: descriptionColor,
                                }}
                              >
                                {renderRichText(
                                  descriptionValue,
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
                                  styles: cards.styles.cta,
                                }}
                                className="ybh-blog-cta"
                                eventName={`blogCta${index}`}
                              />
                            </div>
                          </Background>
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

export const BoutiqueHospitalityBlog: YextComponentConfig<BoutiqueHospitalityBlogProps> =
  {
    label: "Blog",
    fields: toPuckFields<BoutiqueHospitalityBlogProps>(BlogFields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        cardBackgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: "From The Blog: [[address.city]] Travel Guide",
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
      cards: {
        data: blogSource.defaultValue,
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
          },
        },
      },
    },
    render: BoutiqueHospitalityBlogComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityBlog",
  displayName: "Blog",
  description: "Blog",
  pageSetTypes: ["ENTITY"],
};
