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
import { getTextStyle } from "../shared/sectionStyles";

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

type BoutiqueHospitalitySpecialEventsProps = {
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

const EventsFields: YextFields<BoutiqueHospitalitySpecialEventsProps> = {
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
  cta: { label: "Call to Action", type: "comprehensiveCTA" },
};

const BoutiqueHospitalitySpecialEventsComponent: PuckComponent<
  BoutiqueHospitalitySpecialEventsProps
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
  const panelTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(section.panelBackgroundColor, streamDocument),
  );
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ?? panelTextColor;
  const bodyColor = getThemeColorCssValue(body.fontColor) ?? panelTextColor;
  const panelColor = getThemeColorCssValue(section.panelBackgroundColor);
  const overlayColor = getThemeColorCssValue(section.backgroundColor);
  const bodyContent = React.isValidElement(resolvedBody)
    ? resolvedBody
    : (resolvedBody ?? null);
  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalitySpecialEvents${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-events-shell {
            padding: 40px 20px;
          }
          .ybh-events-track {
            max-width: 1200px;
            margin: 0 auto;
          }
          .ybh-events-panel {
            display: grid;
            grid-template-columns: 1fr;
            position: relative;
            border: 1px solid currentColor;
            overflow: hidden;
            min-height: 0;
          }
          .ybh-events-media {
            position: absolute;
            inset: 0;
            overflow: hidden;
            z-index: 1;
          }
          .ybh-events-media::before {
            content: "";
            position: absolute;
            inset: 0;
              background: linear-gradient(
              90deg,
              transparent 0%,
              transparent 42%,
              transparent 58%,
              ${overlayColor} 100%
            );
            pointer-events: none;
            z-index: 1;
          }
          .ybh-events-media .ybh-events-image,
          .ybh-events-media .ybh-events-image img {
            display: block;
            width: 100%;
            height: 100%;
          }
          .ybh-events-media .ybh-events-image img {
            object-fit: cover;
          }
          .ybh-events-copy {
            position: relative;
            z-index: 2;
            width: min(56%, 980px);
            margin: 28px 0 28px auto;
            padding: 24px;
            border: 1px solid currentColor;
            background: ${panelColor};
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .ybh-events-panel--no-image .ybh-events-copy {
            width: auto;
            margin: 0;
          }
          .ybh-events-copy p {
            margin: 0;
          }
          .ybh-events-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            min-height: 48px;
            box-sizing: border-box;
          }
          @media (min-width: 900px) {
            .ybh-events-panel {
              min-height: 0;
            }
            .ybh-events-copy,
            .ybh-events-media {
              grid-area: 1 / 1;
            }
            .ybh-events-copy {
              align-self: stretch;
            }
          }
          @media (max-width: 899px) {
            .ybh-events-panel {
              grid-template-areas:
                "media"
                "copy";
            }
            .ybh-events-media {
              grid-area: media;
              position: relative;
              inset: auto;
              height: 200px;
              max-height: 200px;
              min-height: 0;
            }
            .ybh-events-media::before {
              background: linear-gradient(180deg, transparent 0%, ${overlayColor} 100%);
            }
            .ybh-events-media .ybh-events-image img {
              object-position: center center;
            }
            .ybh-events-copy {
              grid-area: copy;
              width: auto;
              margin: 0;
            }
            .ybh-events-media .ybh-events-image,
            .ybh-events-media .ybh-events-image img {
              object-fit: cover;
            }
          }
        `}</style>
        <Background
          as="section"
          className="ybh-events-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-events-track">
            <Background
              className={`ybh-events-panel${hasImage ? "" : " ybh-events-panel--no-image"}`}
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
                  <div className="ybh-events-media">
                    <Image
                      image={
                        resolvedImage as
                          ImageType | ComplexImageType | TranslatableAssetImage
                      }
                      className="ybh-events-image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio:
                          image.aspectRatio > 0
                            ? `${image.aspectRatio}`
                            : undefined,
                      }}
                    />
                  </div>
                </EntityField>
              ) : null}
              <div className="ybh-events-copy">
                <EntityField
                  displayName="Heading"
                  fieldId={heading.text.field}
                  constantValueEnabled={heading.text.constantValueEnabled}
                >
                  <h2
                    style={{
                      ...getTextStyle(heading.styles),
                      margin: 0,
                      color: headingColor,
                      fontSize:
                        heading.styles.fontSize === "default"
                          ? "clamp(2.25rem, 3.75vw, 3.25rem)"
                          : heading.styles.fontSize,
                    }}
                  >
                    {resolvedHeading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Body"
                  fieldId={body.text.field}
                  constantValueEnabled={body.text.constantValueEnabled}
                >
                  <div style={{ color: bodyColor }}>{bodyContent}</div>
                </EntityField>
                <div>
                  <EntityField
                    displayName="Call to Action"
                    fieldId={cta.data.cta.field}
                    constantValueEnabled={cta.data.cta.constantValueEnabled}
                  >
                    <ComprehensiveCTA
                      value={{ data: cta.data, styles: cta.styles }}
                      className="ybh-events-cta"
                      eventName="eventsPrimaryCta"
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

export const BoutiqueHospitalitySpecialEvents: YextComponentConfig<BoutiqueHospitalitySpecialEventsProps> =
  {
    label: "Special Events",
    fields: EventsFields,
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
          constantValue: "Special Events & Celebrations",
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
              "Host your next unforgettable milestone at [[name]]. From romantic courtyard weddings and elegant proms to upscale corporate galas, our historic venue provides a breathtaking backdrop paired with full-service event planning.<br/><br/>Our spaces feature customizable floor plans, state-of-the-art audiovisual setups, and bespoke catering menus crafted by our executive chef. Contact our dedicated events team today to tour our spaces and secure your dates.",
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
            url: "https://a.mktgcdn.com/p/UHR6VTEvcR-yDMqPSOS7LyK87Qt56EOrmfNbhLQxI08/1267x1900.jpg",
            width: 1267,
            height: 1900,
          },
          constantValueEnabled: true,
        },
        aspectRatio: 0.67,
        imageConstrain: "filled",
      },
      cta: createCta({ label: "Contact Us", variant: "secondary" }),
    },
    render: BoutiqueHospitalitySpecialEventsComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalitySpecialEvents",
  displayName: "Special Events",
  description: "Special Events",
  pageSetTypes: ["ENTITY"],
};
