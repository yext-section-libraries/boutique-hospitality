import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import {
  Address,
  AnalyticsScopeProvider,
  HoursTable,
  Link,
  type AddressType,
  type HoursType,
} from "@yext/pages-components";
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
  MaybeRTF,
  resolveComponentData,
  ThemeColor,
  useDocument,
  VisibilityWrapper,
  type MaybeRTFProps,
  type StyledTextValue,
  type TranslatableAssetImage,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import type { ComplexImageType, ImageType } from "@yext/pages-components";
import { parsePhoneNumber } from "awesome-phonenumber";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
};

type StyledRtfProps = {
  text: YextEntityField<TranslatableRichText>;
};

type StyledTextListProps = {
  text: YextEntityField<string[]>;
};

type PanelTextStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type ImageFieldProps = {
  image: YextEntityField<ImageType | ComplexImageType | TranslatableAssetImage>;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label: YextEntityField<TranslatableString>;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type HoursTableStyles = {
  startOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | "today";
  collapseDays: boolean;
  showAdditionalHoursText: boolean;
  alignment: "items-start" | "items-center" | "items-end";
};

type BoutiqueHospitalityInfoPanelsProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
    panelBackgroundColor: ThemeColor;
  };
  summaryCard: {
    heading: StyledTextProps;
    image: ImageFieldProps;
    addressLabel: StyledTextProps;
    address: YextEntityField<AddressType>;
    showRegion: boolean;
    showCountry: boolean;
    phoneLabel: StyledTextProps;
    phones: PhoneFieldProps;
    accessibilityLabel: StyledTextProps;
    accessibilityBody: StyledRtfProps;
    checkInLabel: StyledTextProps;
    checkInBody: StyledRtfProps;
    visitCta: ComprehensiveCTAValue;
    availabilityCta: ComprehensiveCTAValue;
  };
  hoursCard: {
    heading: StyledTextProps;
    image: ImageFieldProps;
    hours: YextEntityField<HoursType>;
    hoursStyles: HoursTableStyles;
  };
  complimentaryCard: {
    heading: StyledTextProps;
    image: ImageFieldProps;
    list: StyledTextListProps;
  };
  panelStyles: {
    heading: PanelTextStyleProps;
    text: PanelTextStyleProps;
    label: PanelTextStyleProps;
  };
};

const formatPhoneNumber = (
  value: string,
  format: "international" | "domestic",
) => {
  const cleaned = value.replace(/(?!^\+)\+|[^\d+]/g, "");
  const parsed = parsePhoneNumber(cleaned);
  if (!parsed.valid || !parsed.number) {
    return value;
  }
  return format === "international"
    ? parsed.number.international
    : parsed.number.national;
};

const InfoPanelsFields: YextFields<BoutiqueHospitalityInfoPanelsProps> = {
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
  summaryCard: {
    label: "Summary Card",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
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
        },
      },
      addressLabel: {
        label: "Address Label",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
          },
        },
      },
      address: {
        type: "entityField",
        label: "Address",
        filter: { types: ["type.address"] },
      },
      showRegion: {
        label: "Show Region",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      showCountry: {
        label: "Show Country",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
      phoneLabel: {
        label: "Phone Label",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
          },
        },
      },
      phones: {
        label: "Phones",
        type: "object",
        objectFields: {
          items: {
            label: "Items",
            type: "array",
            arrayFields: {
              number: {
                type: "entityField",
                label: "Number",
                filter: { types: ["type.phone"] },
              },
              label: {
                type: "entityField",
                label: "Label",
                filter: { types: ["type.string"] },
              },
            },
            defaultItemProps: {
              number: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              } as YextEntityField<string>,
              label: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              },
            },
            getItemSummary: (item) =>
              (typeof item.label?.constantValue === "string"
                ? item.label.constantValue
                : item.label?.field) ||
              item.number?.field ||
              "Phone",
          },
          phoneFormat: {
            label: "Phone Format",
            type: "radio",
            options: [
              { label: "Domestic", value: "domestic" },
              { label: "International", value: "international" },
            ],
          },
          includeHyperlink: {
            label: "Include Hyperlink",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
        },
      },
      accessibilityLabel: {
        label: "Accessibility Label",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
          },
        },
      },
      accessibilityBody: {
        label: "Accessibility Body",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.rich_text_v2"] },
          },
        },
      },
      checkInLabel: {
        label: "Check-In Label",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
          },
        },
      },
      checkInBody: {
        label: "Check-In Body",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.rich_text_v2"] },
          },
        },
      },
      visitCta: { label: "Visit CTA", type: "comprehensiveCTA" },
      availabilityCta: { label: "Availability CTA", type: "comprehensiveCTA" },
    },
  },
  hoursCard: {
    label: "Hours Card",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
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
        },
      },
      hours: {
        type: "entityField",
        label: "Hours",
        filter: { types: ["type.hours"] },
        disableConstantValueToggle: true,
      },
      hoursStyles: {
        label: "Hours Styles",
        type: "object",
        objectFields: {
          startOfWeek: {
            label: "Start Of Week",
            type: "select",
            options: [
              { label: "Monday", value: "monday" },
              { label: "Tuesday", value: "tuesday" },
              { label: "Wednesday", value: "wednesday" },
              { label: "Thursday", value: "thursday" },
              { label: "Friday", value: "friday" },
              { label: "Saturday", value: "saturday" },
              { label: "Sunday", value: "sunday" },
              { label: "Today", value: "today" },
            ],
          },
          collapseDays: {
            label: "Collapse Days",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          showAdditionalHoursText: {
            label: "Show Additional Hours Text",
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          alignment: {
            label: "Alignment",
            type: "select",
            options: [
              { label: "Start", value: "items-start" },
              { label: "Center", value: "items-center" },
              { label: "End", value: "items-end" },
            ],
          },
        },
      },
    },
  },
  complimentaryCard: {
    label: "Complimentary Card",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text",
            filter: { types: ["type.string"] },
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
        },
      },
      list: {
        label: "Complimentary List",
        type: "object",
        objectFields: {
          text: {
            type: "entityField",
            label: "Text List",
            filter: { types: ["type.string"], includeListsOnly: true },
          },
        },
      },
    },
  },
  panelStyles: {
    label: "Panel Styles",
    type: "object",
    objectFields: {
      heading: {
        label: "Heading",
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
      text: {
        label: "Text",
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
      label: {
        label: "Labels",
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
    },
  },
};

const PanelImage = ({
  image,
  locale,
  overlayColor,
  fadeSide,
}: {
  image: ImageFieldProps;
  locale: string;
  overlayColor?: string;
  fadeSide: "left" | "right";
}) => {
  const streamDocument = useDocument();
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
  if (!hasImage) {
    return null;
  }
  return (
    <EntityField
      displayName="Panel Image"
      fieldId={image.image.field}
      constantValueEnabled={image.image.constantValueEnabled}
    >
      <div className="ybh-info-panel-image">
        <div className="ybh-info-panel-media">
          <Image
            image={
              resolvedImage as
                ImageType | ComplexImageType | TranslatableAssetImage
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />
          {overlayColor ? (
            <div
              className="ybh-info-panel-media-overlay"
              style={{
                background:
                  fadeSide === "left"
                    ? `linear-gradient(90deg, ${overlayColor} 0%, ${overlayColor} 42%, transparent 100%)`
                    : `linear-gradient(90deg, transparent 0%, ${overlayColor} 58%, ${overlayColor} 100%)`,
              }}
              aria-hidden
            />
          ) : null}
        </div>
      </div>
    </EntityField>
  );
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

const BoutiqueHospitalityInfoPanelsComponent: PuckComponent<
  BoutiqueHospitalityInfoPanelsProps
> = ({
  id,
  section,
  summaryCard,
  hoursCard,
  complimentaryCard,
  panelStyles,
  puck,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const cardTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(section.panelBackgroundColor, streamDocument),
  );
  const summaryRichTextStyleOverrides = {
    ...panelStyles.text.styles,
    color: getThemeColorCssValue(panelStyles.text.fontColor) ?? cardTextColor,
  };
  const resolvedSummaryHeading =
    resolveComponentData(summaryCard.heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedAddressLabel =
    resolveComponentData(
      summaryCard.addressLabel.text,
      locale,
      streamDocument,
      { output: "plainText" },
    ) || "";
  const resolvedPhoneLabel =
    resolveComponentData(summaryCard.phoneLabel.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedAccessibilityLabel =
    resolveComponentData(
      summaryCard.accessibilityLabel.text,
      locale,
      streamDocument,
      { output: "plainText" },
    ) || "";
  const resolvedCheckInLabel =
    resolveComponentData(
      summaryCard.checkInLabel.text,
      locale,
      streamDocument,
      { output: "plainText" },
    ) || "";
  const resolvedAddress = resolveComponentData(
    summaryCard.address,
    locale,
    streamDocument,
  );
  const resolvedAccessibility = resolveComponentData(
    summaryCard.accessibilityBody.text,
    locale,
    streamDocument,
    { richTextStyleOverrides: summaryRichTextStyleOverrides },
  );
  const resolvedCheckIn = resolveComponentData(
    summaryCard.checkInBody.text,
    locale,
    streamDocument,
    { richTextStyleOverrides: summaryRichTextStyleOverrides },
  );
  const resolvedHoursHeading =
    resolveComponentData(hoursCard.heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedComplimentaryHeading =
    resolveComponentData(
      complimentaryCard.heading.text,
      locale,
      streamDocument,
      { output: "plainText" },
    ) || "";
  const resolvedComplimentaryList = resolveComponentData(
    complimentaryCard.list.text,
    locale,
    streamDocument,
  );
  const resolvedHours = resolveComponentData(
    hoursCard.hours,
    locale,
    streamDocument,
  );
  const panelBackgroundColor = getThemeColorCssValue(
    section.panelBackgroundColor,
  );
  const cardOverlayColor = getThemeColorCssValue(section.backgroundColor);
  const cardHeadingStyle: React.CSSProperties = {
    marginTop: 0,
    marginBottom: "0.8em",
    color:
      getThemeColorCssValue(panelStyles.heading.fontColor) ?? cardTextColor,
    fontFamily:
      panelStyles.heading.styles.fontFamily === "default"
        ? 'var(--fontFamily-h2-fontFamily, "Fraunces", serif)'
        : panelStyles.heading.styles.fontFamily,
    fontSize:
      panelStyles.heading.styles.fontSize === "default"
        ? "clamp(1.9rem, 3vw, 2.3rem)"
        : panelStyles.heading.styles.fontSize,
    fontWeight:
      panelStyles.heading.styles.fontWeight === "default"
        ? undefined
        : panelStyles.heading.styles.fontWeight,
    fontStyle:
      panelStyles.heading.styles.fontStyle === "default"
        ? undefined
        : panelStyles.heading.styles.fontStyle,
    textTransform:
      panelStyles.heading.styles.textTransform === "default"
        ? undefined
        : panelStyles.heading.styles.textTransform,
    lineHeight: 1.05,
  };
  const panelTextStyle: React.CSSProperties = {
    color: getThemeColorCssValue(panelStyles.text.fontColor) ?? cardTextColor,
    fontFamily:
      panelStyles.text.styles.fontFamily === "default"
        ? undefined
        : panelStyles.text.styles.fontFamily,
    fontSize:
      panelStyles.text.styles.fontSize === "default"
        ? undefined
        : panelStyles.text.styles.fontSize,
    fontWeight:
      panelStyles.text.styles.fontWeight === "default"
        ? undefined
        : panelStyles.text.styles.fontWeight,
    fontStyle:
      panelStyles.text.styles.fontStyle === "default"
        ? undefined
        : panelStyles.text.styles.fontStyle,
    textTransform:
      panelStyles.text.styles.textTransform === "default"
        ? undefined
        : panelStyles.text.styles.textTransform,
  };
  const panelLabelStyle: React.CSSProperties = {
    color: getThemeColorCssValue(panelStyles.label.fontColor) ?? cardTextColor,
    fontFamily:
      panelStyles.label.styles.fontFamily === "default"
        ? undefined
        : panelStyles.label.styles.fontFamily,
    fontSize:
      panelStyles.label.styles.fontSize === "default"
        ? "0.78rem"
        : panelStyles.label.styles.fontSize,
    fontWeight:
      panelStyles.label.styles.fontWeight === "default"
        ? undefined
        : panelStyles.label.styles.fontWeight,
    fontStyle:
      panelStyles.label.styles.fontStyle === "default"
        ? undefined
        : panelStyles.label.styles.fontStyle,
    textTransform:
      panelStyles.label.styles.textTransform === "default"
        ? "uppercase"
        : panelStyles.label.styles.textTransform,
  };
  const resolvedPhones = (summaryCard.phones.items ?? [])
    .map((item) => {
      const phone = resolveComponentData(item.number, locale, streamDocument);
      const normalized = typeof phone === "string" ? phone.trim() : "";
      if (!normalized) {
        return null;
      }
      const label = resolveComponentData(item.label, locale, streamDocument, {
        output: "plainText",
      });
      return {
        label: typeof label === "string" ? label.trim() : "",
        telDigits: normalized.replace(/\D/g, ""),
        formatted: formatPhoneNumber(
          normalized,
          summaryCard.phones.phoneFormat,
        ),
        numberField: item.number,
        labelField: item.label,
      };
    })
    .filter(
      (
        item,
      ): item is {
        label: string;
        telDigits: string;
        formatted: string;
        numberField: YextEntityField<string>;
        labelField: YextEntityField<TranslatableString>;
      } => item !== null,
    );
  const additionalHoursText =
    typeof streamDocument.additionalHoursText === "string"
      ? streamDocument.additionalHoursText.trim()
      : "";
  const alignmentClass =
    hoursCard.hoursStyles.alignment === "items-center"
      ? "items-center"
      : hoursCard.hoursStyles.alignment === "items-end"
        ? "items-end"
        : "items-start";

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityInfoPanels${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-info-shell {
            padding: 40px 20px;
          }
          .ybh-info-track {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            gap: 18px;
          }
          .ybh-info-panel {
            display: grid;
            grid-template-columns: 1fr;
            overflow: hidden;
            position: relative;
          }
          .ybh-info-panel-media {
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
            min-height: 320px;
          }
          .ybh-info-panel-media > div {
            height: 100%;
          }
          .ybh-info-panel-media-overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          .ybh-info-panel-card {
            padding: 22px;
            border: 1px solid currentColor;
            background: ${panelBackgroundColor};
          }
          .ybh-info-grid {
            display: grid;
            gap: 14px;
            color: inherit;
          }
          .ybh-info-field-label {
            letter-spacing: 0.06em;
            margin-bottom: 4px;
          }
          .ybh-info-phone-link {
            text-decoration: none;
          }
          .ybh-info-phone-link:hover {
            text-decoration: underline;
          }
          .ybh-info-cta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 10px;
          }
          .ybh-info-cta-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px 24px;
            min-height: 48px;
            box-sizing: border-box;
          }
          .ybh-info-list {
            margin: 0;
            padding-left: 22px;
            color: inherit;
            display: grid;
            gap: 10px;
            list-style-type: disc;
            list-style-position: outside;
          }
          .ybh-info-list li::marker {
            color: currentColor;
          }
          .ybh-info-hours-wrap {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .ybh-info-hours-wrap.items-start {
            align-items: flex-start;
          }
          .ybh-info-hours-wrap.items-center {
            align-items: center;
          }
          .ybh-info-hours-wrap.items-end {
            align-items: flex-end;
          }
          @media (min-width: 900px) {
            .ybh-info-panel {
              min-height: 0;
            }
            .ybh-info-panel-card,
            .ybh-info-panel-image {
              grid-area: 1 / 1;
            }
            .ybh-info-panel-image {
              z-index: 1;
              position: absolute;
              inset: 0;
            }
            .ybh-info-panel-card {
              z-index: 2;
              width: min(56%, 980px);
              margin: 28px 0 28px 36px;
              align-self: stretch;
            }
            .ybh-info-panel-card:last-child {
              width: auto;
              margin: 0;
            }
            .ybh-info-panel.is-reversed .ybh-info-panel-card {
              justify-self: end;
              margin-left: 0;
              margin-right: 36px;
            }
            .ybh-info-panel.is-reversed .ybh-info-panel-card:last-child {
              justify-self: stretch;
              margin: 0;
            }
          }
          @media (max-width: 899px) {
            .ybh-info-panel {
              grid-template-areas:
                "image"
                "card";
            }
            .ybh-info-panel-image {
              max-height: 200px;
              height: 200px;
              overflow: hidden;
            }
            .ybh-info-panel-image {
              grid-area: image;
              position: relative;
              inset: auto;
              z-index: 1;
            }
            .ybh-info-panel-card {
              grid-area: card;
              width: auto;
              margin: 0;
              align-self: auto;
            }
            .ybh-info-panel-media {
              min-height: 0;
              height: 200px;
            }
            .ybh-info-panel-media-overlay {
              display: none;
            }
            .ybh-info-panel-media img {
              object-fit: cover !important;
              object-position: center center !important;
            }
          }
        `}</style>
        <Background
          as="section"
          className="ybh-info-shell"
          background={section.backgroundColor}
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-info-track">
            <article className="ybh-info-panel">
              <Background
                className="ybh-info-panel-card"
                background={section.panelBackgroundColor}
                style={getSurfaceColorStyle(
                  section.panelBackgroundColor,
                  streamDocument,
                )}
              >
                <EntityField
                  displayName="Summary Heading"
                  fieldId={summaryCard.heading.text.field}
                  constantValueEnabled={
                    summaryCard.heading.text.constantValueEnabled
                  }
                >
                  <h2 style={cardHeadingStyle}>{resolvedSummaryHeading}</h2>
                </EntityField>
                <div className="ybh-info-grid" style={panelTextStyle}>
                  <div>
                    <EntityField
                      displayName="Address Label"
                      fieldId={summaryCard.addressLabel.text.field}
                      constantValueEnabled={
                        summaryCard.addressLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="ybh-info-field-label"
                        style={panelLabelStyle}
                      >
                        {resolvedAddressLabel}
                      </div>
                    </EntityField>
                    {resolvedAddress ? (
                      <EntityField
                        displayName="Address"
                        fieldId={summaryCard.address.field}
                        constantValueEnabled={
                          summaryCard.address.constantValueEnabled
                        }
                      >
                        <Address
                          address={resolvedAddress}
                          showRegion={summaryCard.showRegion}
                          showCountry={summaryCard.showCountry}
                        />
                      </EntityField>
                    ) : null}
                  </div>
                  <div>
                    <EntityField
                      displayName="Phone Label"
                      fieldId={summaryCard.phoneLabel.text.field}
                      constantValueEnabled={
                        summaryCard.phoneLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="ybh-info-field-label"
                        style={panelLabelStyle}
                      >
                        {resolvedPhoneLabel}
                      </div>
                    </EntityField>
                    {resolvedPhones.map((item) =>
                      summaryCard.phones.includeHyperlink ? (
                        <EntityField
                          key={item.formatted}
                          displayName="Phone Number"
                          fieldId={item.numberField.field}
                          constantValueEnabled={
                            item.numberField.constantValueEnabled
                          }
                        >
                          <Link
                            cta={{ link: item.telDigits, linkType: "PHONE" }}
                            className="ybh-info-phone-link"
                          >
                            {item.label ? (
                              <EntityField
                                displayName="Phone Label"
                                fieldId={item.labelField.field}
                                constantValueEnabled={
                                  item.labelField.constantValueEnabled
                                }
                              >
                                <span>{item.label} </span>
                              </EntityField>
                            ) : null}
                            {item.formatted}
                          </Link>
                        </EntityField>
                      ) : (
                        <EntityField
                          key={item.formatted}
                          displayName="Phone Number"
                          fieldId={item.numberField.field}
                          constantValueEnabled={
                            item.numberField.constantValueEnabled
                          }
                        >
                          <span>
                            {item.label ? (
                              <EntityField
                                displayName="Phone Label"
                                fieldId={item.labelField.field}
                                constantValueEnabled={
                                  item.labelField.constantValueEnabled
                                }
                              >
                                <span>{item.label} </span>
                              </EntityField>
                            ) : null}
                            {item.formatted}
                          </span>
                        </EntityField>
                      ),
                    )}
                  </div>
                  <div>
                    <EntityField
                      displayName="Accessibility Label"
                      fieldId={summaryCard.accessibilityLabel.text.field}
                      constantValueEnabled={
                        summaryCard.accessibilityLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="ybh-info-field-label"
                        style={panelLabelStyle}
                      >
                        {resolvedAccessibilityLabel}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Accessibility Body"
                      fieldId={summaryCard.accessibilityBody.text.field}
                      constantValueEnabled={
                        summaryCard.accessibilityBody.text.constantValueEnabled
                      }
                    >
                      <div>
                        {renderResolvedRichText(
                          resolvedAccessibility,
                          summaryRichTextStyleOverrides,
                        )}
                      </div>
                    </EntityField>
                  </div>
                  <div>
                    <EntityField
                      displayName="Check-In Label"
                      fieldId={summaryCard.checkInLabel.text.field}
                      constantValueEnabled={
                        summaryCard.checkInLabel.text.constantValueEnabled
                      }
                    >
                      <div
                        className="ybh-info-field-label"
                        style={panelLabelStyle}
                      >
                        {resolvedCheckInLabel}
                      </div>
                    </EntityField>
                    <EntityField
                      displayName="Check-In Body"
                      fieldId={summaryCard.checkInBody.text.field}
                      constantValueEnabled={
                        summaryCard.checkInBody.text.constantValueEnabled
                      }
                    >
                      <div>
                        {renderResolvedRichText(
                          resolvedCheckIn,
                          summaryRichTextStyleOverrides,
                        )}
                      </div>
                    </EntityField>
                  </div>
                  <div className="ybh-info-cta-row">
                    <EntityField
                      displayName="Visit Call to Action"
                      fieldId={summaryCard.visitCta.data.cta.field}
                      constantValueEnabled={
                        summaryCard.visitCta.data.cta.constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={{
                          data: summaryCard.visitCta.data,
                          styles: summaryCard.visitCta.styles,
                        }}
                        className="ybh-info-cta-button"
                        eventName="hotelSummaryPrimaryCta"
                      />
                    </EntityField>
                    <EntityField
                      displayName="Availability Call to Action"
                      fieldId={summaryCard.availabilityCta.data.cta.field}
                      constantValueEnabled={
                        summaryCard.availabilityCta.data.cta
                          .constantValueEnabled
                      }
                    >
                      <ComprehensiveCTA
                        value={{
                          data: summaryCard.availabilityCta.data,
                          styles: summaryCard.availabilityCta.styles,
                        }}
                        className="ybh-info-cta-button"
                        eventName="hotelSummarySecondaryCta"
                      />
                    </EntityField>
                  </div>
                </div>
              </Background>
              <PanelImage
                image={summaryCard.image}
                locale={locale}
                overlayColor={cardOverlayColor}
                fadeSide="left"
              />
            </article>

            <article className="ybh-info-panel is-reversed">
              <Background
                className="ybh-info-panel-card"
                background={section.panelBackgroundColor}
                style={getSurfaceColorStyle(
                  section.panelBackgroundColor,
                  streamDocument,
                )}
              >
                <EntityField
                  displayName="Hours Heading"
                  fieldId={hoursCard.heading.text.field}
                  constantValueEnabled={
                    hoursCard.heading.text.constantValueEnabled
                  }
                >
                  <h2 style={cardHeadingStyle}>{resolvedHoursHeading}</h2>
                </EntityField>
                <EntityField
                  displayName="Hours"
                  fieldId={hoursCard.hours.field}
                  constantValueEnabled={hoursCard.hours.constantValueEnabled}
                >
                  <div
                    className={`ybh-info-hours-wrap ${alignmentClass}`}
                    style={panelTextStyle}
                  >
                    {resolvedHours ? (
                      <>
                        <HoursTable
                          hours={resolvedHours}
                          comingSoon={streamDocument.comingSoon}
                          startOfWeek={hoursCard.hoursStyles.startOfWeek}
                          collapseDays={hoursCard.hoursStyles.collapseDays}
                        />
                        {hoursCard.hoursStyles.showAdditionalHoursText &&
                        additionalHoursText ? (
                          <div style={{ color: cardTextColor }}>
                            {additionalHoursText}
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </EntityField>
              </Background>
              <PanelImage
                image={hoursCard.image}
                locale={locale}
                overlayColor={cardOverlayColor}
                fadeSide="right"
              />
            </article>

            <article className="ybh-info-panel">
              <Background
                className="ybh-info-panel-card"
                background={section.panelBackgroundColor}
                style={getSurfaceColorStyle(
                  section.panelBackgroundColor,
                  streamDocument,
                )}
              >
                <EntityField
                  displayName="Complimentary Items Heading"
                  fieldId={complimentaryCard.heading.text.field}
                  constantValueEnabled={
                    complimentaryCard.heading.text.constantValueEnabled
                  }
                >
                  <h2 style={cardHeadingStyle}>
                    {resolvedComplimentaryHeading}
                  </h2>
                </EntityField>
                <EntityField
                  displayName="Complimentary Items"
                  fieldId={complimentaryCard.list.text.field}
                  constantValueEnabled={
                    complimentaryCard.list.text.constantValueEnabled
                  }
                >
                  <ul className="ybh-info-list" style={panelTextStyle}>
                    {Array.isArray(resolvedComplimentaryList)
                      ? resolvedComplimentaryList.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))
                      : null}
                  </ul>
                </EntityField>
              </Background>
              <PanelImage
                image={complimentaryCard.image}
                locale={locale}
                overlayColor={cardOverlayColor}
                fadeSide="left"
              />
            </article>
          </div>
        </Background>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityInfoPanels: YextComponentConfig<BoutiqueHospitalityInfoPanelsProps> =
  {
    label: "Info Panels",
    fields: InfoPanelsFields,
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
      summaryCard: {
        heading: {
          text: {
            field: "",
            constantValue: "Hotel Summary",
            constantValueEnabled: true,
          },
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
        },
        addressLabel: {
          text: {
            field: "",
            constantValue: "Address",
            constantValueEnabled: true,
          },
        },
        address: {
          field: "address",
          constantValue: {
            line1: "",
            city: "",
            postalCode: "",
            countryCode: "",
            region: "",
          },
          constantValueEnabled: false,
        },
        showRegion: true,
        showCountry: false,
        phoneLabel: {
          text: {
            field: "",
            constantValue: "Main Reservations",
            constantValueEnabled: true,
          },
        },
        phones: {
          items: [
            {
              number: {
                field: "mainPhone",
                constantValue: "",
                constantValueEnabled: false,
              },
              label: {
                field: "",
                constantValue: "",
                constantValueEnabled: true,
              },
            },
          ],
          phoneFormat: "domestic",
          includeHyperlink: true,
        },
        accessibilityLabel: {
          text: {
            field: "",
            constantValue: "Accessibility",
            constantValueEnabled: true,
          },
        },
        accessibilityBody: {
          text: {
            field: "",
            constantValue: {
              hasLocalizedValue: "true",
              defaultValue: getDefaultRTF(
                "Step-free main entrance, ADA-compliant accessible rooms, elevator access to all floors, braille signage",
              ),
            },
            constantValueEnabled: true,
          },
        },
        checkInLabel: {
          text: {
            field: "",
            constantValue: "Check-In/Out",
            constantValueEnabled: true,
          },
        },
        checkInBody: {
          text: {
            field: "",
            constantValue: {
              hasLocalizedValue: "true",
              defaultValue: getDefaultRTF(
                "Standard Check-In: 4:00 PM | Standard Check-Out: 11:00 AM",
              ),
            },
            constantValueEnabled: true,
          },
        },
        visitCta: {
          data: {
            actionType: "link",
            cta: {
              field: "",
              constantValue: {
                label: "Visit Website",
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
            variant: "primary",
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
          },
        },
        availabilityCta: {
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
      hoursCard: {
        heading: {
          text: {
            field: "",
            constantValue: "Desk & Service Hours",
            constantValueEnabled: true,
          },
        },
        image: {
          image: {
            field: "",
            constantValue: {
              url: "https://a.mktgcdn.com/p/fbSbItkZpsHpkc8qHH7GxvQkWzxsfm6mGc0k4Lmfl-A/1267x1900.jpg",
              width: 1267,
              height: 1900,
            },
            constantValueEnabled: true,
          },
        },
        hours: {
          field: "hours",
          constantValue: {},
          constantValueEnabled: false,
        } as YextEntityField<HoursType>,
        hoursStyles: {
          startOfWeek: "monday",
          collapseDays: false,
          showAdditionalHoursText: false,
          alignment: "items-start",
        },
      },
      complimentaryCard: {
        heading: {
          text: {
            field: "",
            constantValue: "Complimentary Services",
            constantValueEnabled: true,
          },
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
        },
        list: {
          text: {
            field: "",
            constantValue: [
              "High-Speed Wi-Fi (Property-Wide)",
              "Morning Artisanal Coffee & Tea Station",
              "Evening Social Hour (Local Wine & Cheese)",
              "Digital Concierge App Access",
              "Luxury Bicycle Rentals",
              "Free cancellation up to 48 hours prior to arrival for direct bookings",
            ],
            constantValueEnabled: true,
          },
        },
      },
      panelStyles: {
        heading: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        text: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        label: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
      },
    },
    render: BoutiqueHospitalityInfoPanelsComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityInfoPanels",
  displayName: "Info Panels",
  description: "Info Panels",
  pageSetTypes: ["ENTITY"],
};
