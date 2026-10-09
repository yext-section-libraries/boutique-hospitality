import { pt } from "@yext/visual-editor";
import type { SectionConfig } from "@yext/visual-editor";

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
  msg,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import { createCta } from "../shared/createCta";
import { aspectRatioOptions } from "../shared/fieldOptions";
import { getTextStyle, renderRichText, resolveRichTextStyles } from "../shared/sectionStyles";

type StyledTextProps = {
  text: YextEntityField<string>;
  styles: StyledTextValue;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
  styles: StyledTextValue;
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
    label: msg("fields.section", "Section"),
    type: "object",
    objectFields: {
      visibleOnLivePage: {
        label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      backgroundColor: {
        label: msg("fields.backgroundColor", "Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
      panelBackgroundColor: {
        label: msg("fields.panelBackgroundColor", "Panel Background Color"),
        type: "basicSelector",
        options: "BACKGROUND_COLOR",
      },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.string"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
        includeColor: true,
      },
    },
  },
  body: {
    label: msg("fields.body", "Body"),
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: msg("fields.text", "Text"),
        filter: { types: ["type.rich_text_v2"] },
      },
      styles: {
        label: msg("fields.textStyles", "Text Styles"),
        type: "styledText",
        includeColor: true,
      },
    },
  },
  image: {
    label: msg("fields.image", "Image"),
    type: "object",
    objectFields: {
      image: {
        type: "entityField",
        label: msg("fields.image", "Image"),
        filter: { types: ["type.image"] },
      },
      aspectRatio: {
        label: msg("fields.aspectRatio", "Aspect Ratio"),
        type: "basicSelector",
        options: aspectRatioOptions,
      },
      imageConstrain: {
        label: msg("fields.imageConstrain", "Image Constrain"),
        type: "select",
        options: [
          { label: msg("fields.options.fixed", "Fixed"), value: "fixed" },
          { label: msg("fields.options.filled", "Filled"), value: "filled" },
        ],
      },
    },
  },
  cta: {
    label: msg("fields.callToAction", "Call to Action"),
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
    getThemeColorCssValue(body.styles.color) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.panelBackgroundColor, streamDocument),
    );
  const bodyContent = renderRichText(
    resolvedBody,
    resolveRichTextStyles(
      body.styles,
      getDefaultForegroundColor(section.panelBackgroundColor, streamDocument),
    ),
  );

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
                displayName={pt("fields.heading", "Heading")}
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  style={{
                    ...getTextStyle(heading.styles),
                    margin: 0,
                    color:
                      getThemeColorCssValue(heading.styles.color) ??
                      getThemeColorCssValue(
                        getDefaultForegroundColor(
                          section.backgroundColor,
                          streamDocument,
                        ),
                      ),
                    fontFamily: heading.styles.fontFamily === "default"
                      ? "var(--fontFamily-h2-fontFamily, 'Fraunces', serif)"
                      : heading.styles.fontFamily,
                    fontSize: heading.styles.fontSize === "default"
                      ? "clamp(1.9rem, 3vw, 2.3rem)"
                      : heading.styles.fontSize,
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
                  displayName={pt("fields.image", "Image")}
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
                  displayName={pt("fields.body", "Body")}
                  fieldId={body.text.field}
                  constantValueEnabled={body.text.constantValueEnabled}
                >
                  <div>{bodyContent}</div>
                </EntityField>
                <div>
                  <EntityField
                    displayName={pt("fields.callToAction", "Call to Action")}
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
    label: msg("components.aboutHotel", "About"),
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
      cta: createCta({ label: "Check Availability", variant: "secondary" }),
    },
    render: BoutiqueHospitalityAboutHotelComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityAboutHotel",
  displayName: "About",
  description: "About",
  pageSetTypes: ["ENTITY"],
};
