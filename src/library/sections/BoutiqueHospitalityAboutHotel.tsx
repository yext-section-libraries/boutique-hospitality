import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  Background,
  ComprehensiveCTA,
  type ComprehensiveCTAValue,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  Image,
  resolveComponentData,
  ThemeColor,
  ThemeOptions,
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

type ImageFieldProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
  aspectRatio: number;
  imageConstrain: "fixed" | "filled";
};

type BoutiqueHospitalityAboutHotelProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    panelBackgroundColor: ThemeColor;
  };
  heading: StyledTextProps;
  body: StyledRtfProps;
  image: ImageFieldProps;
  cta: ComprehensiveCTAValue;
};

const AboutHotelFields: YextFields<BoutiqueHospitalityAboutHotelProps> = {
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
      panelBackgroundColor: {
        label: "Panel Background Color",
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
  body: {
    label: "Body",
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
  cta: {
    label: "Call to Action",
    type: "comprehensiveCTA",
  },
};

const BoutiqueHospitalityAboutHotelComponent: PuckComponent<
  BoutiqueHospitalityAboutHotelProps
> = ({ id, section, heading, body, image, cta, puck }) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument) || "";
  const resolvedBody = resolveComponentData(body.text, locale, streamDocument);
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
  const textColor =
    getThemeColorCssValue(body.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.panelBackgroundColor, streamDocument),
    );
  const bodyContent = React.isValidElement(resolvedBody)
    ? resolvedBody
    : (resolvedBody ?? null);

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityAboutHotel${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            .ybh-about-shell {
              padding: 40px 20px;
            }
            .ybh-about-track {
              max-width: 1200px;
              margin: 0 auto;
            }
            .ybh-about-heading-row {
              display: flex;
              align-items: center;
              gap: 16px;
              margin-bottom: 28px;
            }
            .ybh-about-line {
              width: 28px;
              height: 1px;
              background: var(--colors-palette-primary);
              flex-shrink: 0;
            }
            .ybh-about-panel {
              display: grid;
              grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
              gap: 32px;
              border: 1px solid currentColor;
              padding: 24px;
            }
            .ybh-about-panel--no-image {
              grid-template-columns: 1fr;
            }
          .ybh-about-copy {
            display: flex;
            flex-direction: column;
            gap: 18px;
            justify-content: space-between;
          }
          .ybh-about-image {
            width: 100%;
          }
          .ybh-about-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            min-height: 48px;
            box-sizing: border-box;
          }
          .ybh-about-copy .MaybeRTF p {
            margin: 0 0 16px;
          }
          @media (max-width: 767px) {
            .ybh-about-panel {
              grid-template-columns: 1fr;
            }
            .ybh-about-image {
              max-height: 450px;
              overflow: hidden;
            }
            .ybh-about-image img {
              object-fit: cover !important;
              object-position: center center;
            }
          }
        `}</style>
        <Background
          as="section"
          className="ybh-about-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-about-track">
            <div className="ybh-about-heading-row">
              <span className="ybh-about-line" aria-hidden />
              <EntityField
                displayName="Heading"
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  style={{
                    margin: 0,
                    color:
                      getThemeColorCssValue(heading.fontColor) ??
                      getThemeColorCssValue(
                        getDefaultForegroundColor(
                          section.backgroundColor,
                          streamDocument,
                        ),
                      ),
                    fontFamily:
                      "var(--fontFamily-h2-fontFamily, 'Fraunces', serif)",
                    fontSize: "clamp(1.9rem, 3vw, 2.3rem)",
                  }}
                >
                  {resolvedHeading}
                </h2>
              </EntityField>
            </div>
            <Background
              className={`ybh-about-panel${hasImage ? "" : " ybh-about-panel--no-image"}`}
              background={section.panelBackgroundColor}
              style={getSurfaceColorStyle(
                section.panelBackgroundColor,
                streamDocument,
              )}
            >
              {hasImage ? (
                <EntityField
                  displayName="Image"
                  fieldId={image.image.field}
                  constantValueEnabled={image.image.constantValueEnabled}
                >
                  <div className="ybh-about-image">
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
              <div className="ybh-about-copy" style={{ color: textColor }}>
                <EntityField
                  displayName="Body"
                  fieldId={body.text.field}
                  constantValueEnabled={body.text.constantValueEnabled}
                >
                  <div>{bodyContent}</div>
                </EntityField>
                <div>
                  <EntityField
                    displayName="Call to Action"
                    fieldId={cta.data.cta.field}
                    constantValueEnabled={cta.data.cta.constantValueEnabled}
                  >
                    <ComprehensiveCTA
                      value={{ data: cta.data, styles: cta.styles }}
                      className="ybh-about-cta"
                      eventName="aboutPrimaryCta"
                    />
                  </EntityField>
                </div>
              </div>
            </Background>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityAboutHotel: YextComponentConfig<BoutiqueHospitalityAboutHotelProps> =
  {
    label: "About Hotel",
    fields: AboutHotelFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
        panelBackgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heading: {
        text: {
          field: "",
          constantValue: "About This Hotel",
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
      body: {
        text: {
          field: "",
          constantValue: {
            hasLocalizedValue: "true",
            defaultValue: getDefaultRTF(
              "[[name]] is located at [[address.line1]], serving as the perfect boutique hotel for travelers enchanted by [[address.city]]'s rich history. Our beautifully preserved piazza and intimate lobby, seamlessly combining modern architecture with high-end conveniences.<br/><br/>The hotel features beautifully restored architecture details, an expansive rooftop terrace, chef-driven culinary experiences, a spa library lounge for wellness rituals, and concierge-led local activity curation for every stay.",
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
            url: "https://a.mktgcdn.com/p/vQqhmnexQfZueJGyh5M_j5W4EcTkTyZlW93eIoqjjvQ/1900x1267.jpg",
            width: 1900,
            height: 1267,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 1.5,
        imageConstrain: "filled",
      },
      cta: {
        data: {
          actionType: "link",
          cta: {
            field: "",
            constantValue: {
              label: "Check Availability",
              link: "#",
              linkType: "URL",
              ctaType: "textAndLink",
            },
            constantValueEnabled: true,
            selectedType: "textAndLink",
          },
          openInNewTab: false,
        },
        styles: {
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
    render: BoutiqueHospitalityAboutHotelComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityAboutHotel",
  displayName: "About Hotel",
  description: "About Hotel",
  pageSetTypes: ["ENTITY"],
};
