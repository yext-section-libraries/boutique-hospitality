import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";
import {
  createItemSource,
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getDefaultRTF,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  ThemeColor,
  toPuckFields,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableRichText,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { renderRichText } from "../shared/sectionStyles";

type FaqItemFields = {
  question: YextEntityField<TranslatableString>;
  answer: YextEntityField<TranslatableRichText>;
};

const faqSource = createItemSource<FaqItemFields>({
  label: "FAQ Items",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: { types: ["type.string"] },
    },
    answer: {
      type: "entityField",
      label: "Answer",
      filter: { types: ["type.rich_text_v2"] },
    },
  },
  defaultValues: [
    {
      question: {
        field: "",
        constantValue: "What Is The Cancellation Policy At [[name]]?",
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "We offer free cancellation up to 48 hours prior to your scheduled arrival date for all direct bookings made through our website or reservation desk.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: "Is Parking Available On-Site, And What Is The Cost?",
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Valet parking is available daily for overnight guests and event visitors. Standard nightly charges apply.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: "Does [[name]] Allow Pets?",
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Select pet-friendly rooms are available with advance notice. Breed and weight restrictions may apply.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: "Do You Offer An Airport Shuttle?",
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "The concierge team can arrange private transportation and airport transfers for a fee.",
          ),
        },
        constantValueEnabled: true,
      },
    },
    {
      question: {
        field: "",
        constantValue: "Can I Request An Early Check-In Or Late Check-Out?",
        constantValueEnabled: true,
      },
      answer: {
        field: "",
        constantValue: {
          hasLocalizedValue: "true",
          defaultValue: getDefaultRTF(
            "Yes. Early arrival and late departure are based on availability and may include an additional charge.",
          ),
        },
        constantValueEnabled: true,
      },
    },
  ],
});

type BoutiqueHospitalityFaqProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  heading: {
    text: YextEntityField<TranslatableString>;
    styles: StyledTextValue;
    fontColor?: ThemeColor;
  };
  faqs: {
    items: typeof faqSource.value;
    question: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
    answer: {
      styles: StyledTextValue;
      fontColor?: ThemeColor;
    };
  };
};

const FaqFields: YextFields<BoutiqueHospitalityFaqProps> = {
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
  faqs: {
    label: "FAQs",
    type: "object",
    objectFields: {
      items: faqSource.field,
      question: {
        label: "Question",
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
      answer: {
        label: "Answer",
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

const BoutiqueHospitalityFaqComponent: PuckComponent<
  BoutiqueHospitalityFaqProps
> = ({ id, section, heading, faqs, puck }) => {
  const streamDocument = useDocument();
  const analytics = useAnalytics();
  const locale = streamDocument.locale ?? "en";
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const resolvedItems = faqSource.resolveItems(faqs.items, streamDocument);
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const questionColor =
    getThemeColorCssValue(faqs.question.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const answerColor =
    getThemeColorCssValue(faqs.answer.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityFaq${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-faq-shell {
            padding: 40px 20px;
          }
          .ybh-faq-track {
            max-width: 1200px;
            margin: 0 auto;
          }
          .ybh-faq-heading {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .ybh-faq-line {
            width: 28px;
            height: 1px;
            background: var(--colors-palette-primary);
          }
          .ybh-faq-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
          }
          .ybh-faq-item {
            border-top: 1px solid currentColor;
          }
          .ybh-faq-button {
            width: 100%;
            border: 0;
            background: transparent;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 0;
            color: ${questionColor};
            cursor: pointer;
          }
          .ybh-faq-answer {
            padding: 0 0 18px;
            color: ${answerColor};
          }
        `}</style>
        <section
          className="ybh-faq-shell"
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-faq-track">
            <div className="ybh-faq-heading">
              <span className="ybh-faq-line" aria-hidden />
              <EntityField
                displayName="Heading"
                fieldId={heading.text.field}
                constantValueEnabled={heading.text.constantValueEnabled}
              >
                <h2
                  className="ybh-faq-heading-text"
                  style={{
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
              displayName="FAQ Items"
              fieldId={faqs.items.field}
              constantValueEnabled={faqs.items.constantValueEnabled}
            >
              <div style={{ color: questionColor }}>
                {resolvedItems.map((item, index) => {
                  const questionText =
                    resolveComponentData(
                      item.question,
                      locale,
                      streamDocument,
                      { output: "plainText" },
                    ) || "";
                  const answerRichTextStyleOverrides = {
                    ...faqs.answer.styles,
                    color: answerColor,
                  };
                  const answerText = item.answer;
                  const answerValue = answerText
                    ? resolveComponentData(answerText, locale, streamDocument)
                    : undefined;
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={`${questionText}-${index}`}
                      className="ybh-faq-item"
                    >
                      <button
                        type="button"
                        className="ybh-faq-button"
                        onClick={() => {
                          const nextOpen = openIndex === index ? null : index;
                          setOpenIndex(nextOpen);
                          analytics?.track({
                            action: nextOpen === index ? "EXPAND" : "COLLAPSE",
                            eventName: `faqToggle${index}`,
                          });
                        }}
                      >
                        <span
                          style={{
                            color: questionColor,
                            fontFamily:
                              faqs.question.styles.fontFamily === "default"
                                ? undefined
                                : faqs.question.styles.fontFamily,
                            fontSize:
                              faqs.question.styles.fontSize === "default"
                                ? undefined
                                : faqs.question.styles.fontSize,
                            fontWeight:
                              faqs.question.styles.fontWeight === "default"
                                ? undefined
                                : faqs.question.styles.fontWeight,
                            fontStyle:
                              faqs.question.styles.fontStyle === "default"
                                ? undefined
                                : faqs.question.styles.fontStyle,
                            textTransform:
                              faqs.question.styles.textTransform === "default"
                                ? undefined
                                : faqs.question.styles.textTransform,
                          }}
                        >
                          {questionText}
                        </span>
                        <span>{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen ? (
                        <div
                          className="ybh-faq-answer"
                          style={{
                            color: answerColor,
                          }}
                        >
                          {renderRichText(
                            answerValue,
                            answerRichTextStyleOverrides,
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </EntityField>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityFaq: YextComponentConfig<BoutiqueHospitalityFaqProps> =
  {
    label: "FAQ",
    fields: toPuckFields<BoutiqueHospitalityFaqProps>(FaqFields),
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      heading: {
        text: { field: "", constantValue: "FAQs", constantValueEnabled: true },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
        fontColor: undefined,
      },
      faqs: {
        items: faqSource.defaultValue,
        question: {
          styles: {
            fontFamily: "default",
            fontSize: "default",
            fontWeight: "default",
            fontStyle: "default",
            textTransform: "default",
          },
          fontColor: undefined,
        },
        answer: {
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
    render: BoutiqueHospitalityFaqComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityFaq",
  displayName: "FAQ",
  description: "FAQ",
  pageSetTypes: ["ENTITY"],
};
