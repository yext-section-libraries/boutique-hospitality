import type { SectionConfig } from "@yext/visual-editor";

import type { PuckComponent } from "@puckeditor/core";
import {
  Address,
  AnalyticsScopeProvider,
  Link,
  type AddressType,
} from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getSurfaceColorStyle,
  resolveComponentData,
  ThemeColor,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import { getTextStyle } from "../shared/sectionStyles";

type StyledTextProps = {
  text: YextEntityField<string>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type TextOnlyProps = {
  text: YextEntityField<TranslatableString>;
};

type LinkItem = {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<TranslatableString>;
};

type PhoneItemProps = {
  number: YextEntityField<string>;
  label?: YextEntityField<TranslatableString>;
};

type PhoneFieldProps = {
  items: PhoneItemProps[];
  phoneFormat: "international" | "domestic";
  includeHyperlink?: boolean;
};

type BoutiqueHospitalityFooterProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  brand: StyledTextProps;
  contactStyles: Omit<StyledTextProps, "text">;
  address: YextEntityField<AddressType>;
  showRegion: boolean;
  showCountry: boolean;
  phones: PhoneFieldProps;
  linkColumnStyles: Omit<StyledTextProps, "text">;
  linkStyles: Omit<StyledTextProps, "text">;
  quickLinksHeading: TextOnlyProps;
  quickLinks: LinkItem[];
  socialLinksHeading: TextOnlyProps;
  socialLinks: LinkItem[];
};

const FooterFields: YextFields<BoutiqueHospitalityFooterProps> = {
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
  brand: {
    label: "Brand",
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
            label: "Label",
            type: "entityField",
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
            : item.label?.field) || item.number?.field || "Phone",
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
  contactStyles: {
    label: "Contact Text Styles",
    type: "object",
    objectFields: {
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: { label: "Font Color", type: "basicSelector", options: "SITE_COLOR" },
    },
  },
  linkColumnStyles: {
    label: "Link Column Heading Styles",
    type: "object",
    objectFields: {
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: { label: "Font Color", type: "basicSelector", options: "SITE_COLOR" },
    },
  },
  linkStyles: {
    label: "Link Styles",
    type: "object",
    objectFields: {
      styles: { label: "Text Styles", type: "styledText" },
      fontColor: { label: "Font Color", type: "basicSelector", options: "SITE_COLOR" },
    },
  },
  quickLinksHeading: {
    label: "Quick Links Heading",
    type: "object",
    objectFields: {
      text: { type: "entityField", label: "Text", filter: { types: ["type.string"] } },
    },
  },
  quickLinks: {
    label: "Quick Links",
    type: "array",
    arrayFields: {
      label: {
        label: "Label",
        type: "entityField",
        filter: { types: ["type.string"] },
      },
      link: {
        label: "Link",
        type: "entityField",
        filter: { types: ["type.string"] },
      },
    },
    defaultItemProps: {
      label: {
        field: "",
        constantValue: "Link",
        constantValueEnabled: true,
      },
      link: {
        field: "",
        constantValue: "#",
        constantValueEnabled: true,
      },
    },
    getItemSummary: (item) =>
      (typeof item.label?.constantValue === "string"
        ? item.label.constantValue
        : item.label?.field) || "Quick Link",
  },
  socialLinksHeading: {
    label: "Social Links Heading",
    type: "object",
    objectFields: {
      text: { type: "entityField", label: "Text", filter: { types: ["type.string"] } },
    },
  },
  socialLinks: {
    label: "Social Links",
    type: "array",
    arrayFields: {
      label: {
        label: "Label",
        type: "entityField",
        filter: { types: ["type.string"] },
      },
      link: {
        label: "Link",
        type: "entityField",
        filter: { types: ["type.string"] },
      },
    },
    defaultItemProps: {
      label: {
        field: "",
        constantValue: "Link",
        constantValueEnabled: true,
      },
      link: {
        field: "",
        constantValue: "#",
        constantValueEnabled: true,
      },
    },
    getItemSummary: (item) =>
      (typeof item.label?.constantValue === "string"
        ? item.label.constantValue
        : item.label?.field) || "Social Link",
  },
};

const BoutiqueHospitalityFooterComponent: PuckComponent<
  BoutiqueHospitalityFooterProps
> = ({
  id,
  brand,
  contactStyles,
  address,
  showRegion,
  showCountry,
  phones,
  linkColumnStyles,
  linkStyles,
  quickLinksHeading,
  quickLinks,
  socialLinksHeading,
  socialLinks,
  section,
  puck,
}) => {
  const streamDocument = useDocument();
  const locale = streamDocument.locale ?? "en";
  const resolvedBrand =
    resolveComponentData(brand.text, locale, streamDocument) || "";
  const resolvedQuickLinksHeading =
    resolveComponentData(quickLinksHeading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedSocialLinksHeading =
    resolveComponentData(socialLinksHeading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedAddress = resolveComponentData(address, locale, streamDocument);
  const resolvedPhones = (phones.items ?? [])
    .map((item) => {
      const resolvedNumber = resolveComponentData(
        item.number,
        locale,
        streamDocument,
      );
      const phoneNumber =
        typeof resolvedNumber === "string" ? resolvedNumber.trim() : "";
      if (!phoneNumber) {
        return null;
      }
      const label = resolveComponentData(item.label, locale, streamDocument, {
        output: "plainText",
      });
      return {
        label: typeof label === "string" ? label.trim() : "",
        phoneNumber,
        formattedNumber: formatPhoneNumber(phoneNumber, phones.phoneFormat),
        telDigits: phoneNumber.replace(/\D/g, ""),
        numberField: item.number,
        labelField: item.label,
      };
    })
    .filter(
      (
        item,
      ): item is {
        label: string;
        phoneNumber: string;
        formattedNumber: string;
        telDigits: string;
        numberField: YextEntityField<string>;
        labelField: YextEntityField<TranslatableString> | undefined;
      } => item !== null,
    );
  const shellStyle = getSurfaceColorStyle(
    section.backgroundColor,
    streamDocument,
  );
  const contactTextStyle = getTextStyle(
    contactStyles.styles,
    contactStyles.fontColor,
  );
  const linkColumnTextStyle = getTextStyle(
    linkColumnStyles.styles,
    linkColumnStyles.fontColor,
  );
  const linkTextStyle = getTextStyle(linkStyles.styles, linkStyles.fontColor);
  const brandTextStyle = getTextStyle(brand.styles, brand.fontColor);

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityFooter${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
            .ybh-footer-shell {
              padding: 40px 20px 28px;
              border-top: 1px solid currentColor;
            }
            .ybh-footer-track {
              max-width: 1200px;
              margin: 0 auto;
              display: grid;
              gap: 32px;
              min-width: 0;
            }
            .ybh-footer-brand {
              font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
              font-size: 1.65rem;
              margin-bottom: 24px;
            }
            .ybh-footer-grid {
              display: grid;
              gap: 24px;
              min-width: 0;
            }
            .ybh-footer-column-title {
              margin: 0 0 16px;
              font-family: var(--fontFamily-body-fontFamily, "Inter", sans-serif);
              font-weight: 600;
            }
            .ybh-footer-link {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
              width: 100%;
              min-width: 0;
              box-sizing: border-box;
              padding: 12px 6px 12px 16px;
              border: 1px solid currentColor;
              color: inherit;
              text-decoration: none;
              margin-top: 10px;
            }
            .ybh-footer-link:hover > span:first-child {
              text-decoration: underline;
            }
            .ybh-footer-link:first-of-type {
              margin-top: 0;
            }
            .ybh-footer-social {
              margin-top: 0;
            }
            .ybh-footer-arrow {
              flex-shrink: 0;
            }
            .ybh-footer-link > span:first-child {
              min-width: 0;
              flex: 1 1 auto;
              overflow-wrap: anywhere;
              word-break: break-word;
            }
            .ybh-footer-contact {
              display: flex;
              flex-direction: column;
              gap: 14px;
              color: inherit;
              min-width: 0;
            }
            .ybh-footer-phone-link {
              text-decoration: none;
            }
            .ybh-footer-phone-link:hover {
              text-decoration: underline;
            }
          
            @media (min-width: 900px) {
              .ybh-footer-grid {
                grid-template-columns: 1fr 1.2fr;
                align-items: start;
              }
              .ybh-footer-links-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 24px;
                min-width: 0;
              }
            }
            @media (max-width: 899px) {
              .ybh-footer-link {
                padding-right: 12px;
                gap: 12px;
                min-width: 0;
              }
              .ybh-footer-social {
                padding-top: 12px;
              }
              .ybh-footer-links-grid > div {
                min-width: 0;
              }
              .ybh-footer-link > span:first-child {
                min-width: 0;
                overflow-wrap: anywhere;
              }
            }
          `}</style>
        <footer className="ybh-footer-shell" style={shellStyle}>
          <div className="ybh-footer-track">
            <div className="ybh-footer-grid">
              <div>
                <EntityField
                  displayName="Brand"
                  fieldId={brand.text.field}
                  constantValueEnabled={brand.text.constantValueEnabled}
                >
                  <div className="ybh-footer-brand" style={brandTextStyle}>
                    {resolvedBrand}
                  </div>
                </EntityField>
                <div className="ybh-footer-contact" style={contactTextStyle}>
                  {resolvedAddress ? (
                    <EntityField
                      displayName="Address"
                      fieldId={address.field}
                      constantValueEnabled={address.constantValueEnabled}
                    >
                      <Address
                        address={resolvedAddress}
                        showRegion={showRegion}
                        showCountry={showCountry}
                      />
                    </EntityField>
                  ) : null}
                  {resolvedPhones.map((item) =>
                    phones.includeHyperlink ? (
                      <EntityField
                        key={item.phoneNumber}
                        displayName="Phone Number"
                        fieldId={item.numberField.field}
                        constantValueEnabled={
                          item.numberField.constantValueEnabled
                        }
                      >
                        <Link
                          cta={{ link: item.telDigits, linkType: "PHONE" }}
                          className="ybh-footer-phone-link"
                        >
                          {item.label && item.labelField ? (
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
                          {item.formattedNumber}
                        </Link>
                      </EntityField>
                    ) : (
                      <EntityField
                        key={item.phoneNumber}
                        displayName="Phone Number"
                        fieldId={item.numberField.field}
                        constantValueEnabled={
                          item.numberField.constantValueEnabled
                        }
                      >
                        <span>
                          {item.label && item.labelField ? (
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
                          {item.formattedNumber}
                        </span>
                      </EntityField>
                    ),
                  )}
                </div>
              </div>
              <div className="ybh-footer-links-grid">
                <div>
                  <EntityField
                    displayName="Quick Links Heading"
                    fieldId={quickLinksHeading.text.field}
                    constantValueEnabled={
                      quickLinksHeading.text.constantValueEnabled
                    }
                  >
                    <p
                      className="ybh-footer-column-title"
                      style={linkColumnTextStyle}
                    >
                      {resolvedQuickLinksHeading}
                    </p>
                  </EntityField>
                  {quickLinks.map((item, index) => {
                    const label =
                      resolveComponentData(item.label, locale, streamDocument, {
                        output: "plainText",
                      }) || "";
                    const link =
                      resolveComponentData(item.link, locale, streamDocument, {
                        output: "plainText",
                      }) || "#";
                    return (
                      <EntityField
                        key={`${label}-${index}`}
                        displayName="Quick Link URL"
                        fieldId={item.link.field}
                        constantValueEnabled={item.link.constantValueEnabled}
                      >
                        <Link
                          cta={{ link, linkType: "URL" }}
                          className="ybh-footer-link"
                          eventName={`footerQuickLink${index}`}
                          style={linkTextStyle}
                        >
                          <EntityField
                            displayName="Quick Link Label"
                            fieldId={item.label.field}
                            constantValueEnabled={
                              item.label.constantValueEnabled
                            }
                          >
                            <span>{label}</span>
                          </EntityField>
                          <span className="ybh-footer-arrow">↗</span>
                        </Link>
                      </EntityField>
                    );
                  })}
                </div>
                <div className="ybh-footer-social">
                  <EntityField
                    displayName="Social Links Heading"
                    fieldId={socialLinksHeading.text.field}
                    constantValueEnabled={
                      socialLinksHeading.text.constantValueEnabled
                    }
                  >
                    <p
                      className="ybh-footer-column-title"
                      style={linkColumnTextStyle}
                    >
                      {resolvedSocialLinksHeading}
                    </p>
                  </EntityField>
                  {socialLinks.map((item, index) => {
                    const label =
                      resolveComponentData(item.label, locale, streamDocument, {
                        output: "plainText",
                      }) || "";
                    const link =
                      resolveComponentData(item.link, locale, streamDocument, {
                        output: "plainText",
                      }) || "#";
                    return (
                      <EntityField
                        key={`${label}-${index}`}
                        displayName="Social Link URL"
                        fieldId={item.link.field}
                        constantValueEnabled={item.link.constantValueEnabled}
                      >
                        <Link
                          cta={{ link, linkType: "URL" }}
                          className="ybh-footer-link"
                          eventName={`footerSocialLink${index}`}
                          style={linkTextStyle}
                        >
                          <EntityField
                            displayName="Social Link Label"
                            fieldId={item.label.field}
                            constantValueEnabled={
                              item.label.constantValueEnabled
                            }
                          >
                            <span>{label}</span>
                          </EntityField>
                          <span className="ybh-footer-arrow">↗</span>
                        </Link>
                      </EntityField>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityFooter: YextComponentConfig<BoutiqueHospitalityFooterProps> =
  {
    label: "Footer",
    fields: FooterFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      brand: {
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
        fontColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
          isDarkColor: false,
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
      contactStyles: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
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
      linkColumnStyles: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      linkStyles: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      quickLinksHeading: {
        text: {
          field: "",
          constantValue: "Quick Links",
          constantValueEnabled: true,
        },
      },
      quickLinks: [
        {
          label: {
            field: "",
            constantValue: "Accommodations",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "Amenities",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "Special Offers",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "Careers",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
      ],
      socialLinksHeading: {
        text: {
          field: "",
          constantValue: "Social",
          constantValueEnabled: true,
        },
      },
      socialLinks: [
        {
          label: {
            field: "",
            constantValue: "Instagram",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "Facebook",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "Pinterest",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
        {
          label: {
            field: "",
            constantValue: "LinkedIn",
            constantValueEnabled: true,
          },
          link: { field: "", constantValue: "#", constantValueEnabled: true },
        },
      ],
    },
    render: BoutiqueHospitalityFooterComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityFooter",
  displayName: "Footer",
  description: "Footer",
  pageSetTypes: ["ENTITY", "DIRECTORY", "LOCATOR"],
};
