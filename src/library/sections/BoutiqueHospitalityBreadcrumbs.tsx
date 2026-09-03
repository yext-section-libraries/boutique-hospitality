import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveBreadcrumbs,
  resolveComponentData,
  ThemeColor,
  useDocument,
  useTemplateProps,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";

type StyledTextProps = {
  text: YextEntityField<TranslatableString>;
  styles: StyledTextValue;
  fontColor?: ThemeColor;
};

type TrailStyleProps = {
  styles: StyledTextValue;
  fontColor?: ThemeColor;
  currentPageColor?: ThemeColor;
  separatorColor?: ThemeColor;
};

type BoutiqueHospitalityBreadcrumbsProps = {
  section: {
    visibleOnLivePage: boolean;
    backgroundColor: ThemeColor;
  };
  directoryRoot: StyledTextProps;
  includeCurrentPage: boolean;
  trailStyles: TrailStyleProps;
};

type BreadcrumbsStreamDocument = {
  locale?: string;
  name?: string;
};

const BreadcrumbsFields: YextFields<BoutiqueHospitalityBreadcrumbsProps> = {
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
  directoryRoot: {
    label: "Directory Root",
    type: "object",
    objectFields: {
      text: {
        type: "entityField",
        label: "Text",
        filter: { types: ["type.string"] },
      },
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
  includeCurrentPage: {
    label: "Include Current Page",
    type: "radio",
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  trailStyles: {
    label: "Trail Styles",
    type: "object",
    objectFields: {
      styles: {
        label: "Text Styles",
        type: "styledText",
      },
      fontColor: {
        label: "Font Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      currentPageColor: {
        label: "Current Page Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
      separatorColor: {
        label: "Separator Color",
        type: "basicSelector",
        options: "SITE_COLOR",
      },
    },
  },
};

const BoutiqueHospitalityBreadcrumbsComponent: PuckComponent<
  BoutiqueHospitalityBreadcrumbsProps
> = ({ id, section, directoryRoot, includeCurrentPage, trailStyles, puck }) => {
    const streamDocument = useDocument<BreadcrumbsStreamDocument>();
    const { relativePrefixToRoot } = useTemplateProps<{
      relativePrefixToRoot?: string;
    }>();
    const locale = streamDocument.locale ?? "en";
    const breadcrumbs = resolveBreadcrumbs(streamDocument);
    const resolvedRootLabel =
      resolveComponentData(directoryRoot.text, locale, streamDocument, {
        output: "plainText",
      }) || "";
    const currentPageLabel = streamDocument.name || "";
    const defaultTextColor = getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
    const rootLabelColor =
      getThemeColorCssValue(directoryRoot.fontColor) ?? defaultTextColor;
    const trailColor =
      getThemeColorCssValue(trailStyles.fontColor) ?? defaultTextColor;
    const currentPageColor =
      getThemeColorCssValue(trailStyles.currentPageColor) ?? trailColor;
    const separatorColor =
      getThemeColorCssValue(trailStyles.separatorColor) ?? currentPageColor;
    const textStyle: React.CSSProperties = {
      fontFamily:
        trailStyles.styles.fontFamily === "default"
          ? undefined
          : trailStyles.styles.fontFamily,
      fontSize:
        trailStyles.styles.fontSize === "default"
          ? undefined
          : trailStyles.styles.fontSize,
      fontWeight:
        trailStyles.styles.fontWeight === "default"
          ? undefined
          : trailStyles.styles.fontWeight,
      fontStyle:
        trailStyles.styles.fontStyle === "default"
          ? undefined
          : trailStyles.styles.fontStyle,
      textTransform:
        trailStyles.styles.textTransform === "default"
          ? undefined
          : trailStyles.styles.textTransform,
      letterSpacing: "0.18em",
      lineHeight: 1.4,
    };
    const rootTextStyle: React.CSSProperties = {
      ...textStyle,
      fontFamily:
        directoryRoot.styles.fontFamily === "default"
          ? textStyle.fontFamily
          : directoryRoot.styles.fontFamily,
      fontSize:
        directoryRoot.styles.fontSize === "default"
          ? textStyle.fontSize
          : directoryRoot.styles.fontSize,
      fontWeight:
        directoryRoot.styles.fontWeight === "default"
          ? textStyle.fontWeight
          : directoryRoot.styles.fontWeight,
      fontStyle:
        directoryRoot.styles.fontStyle === "default"
          ? textStyle.fontStyle
          : directoryRoot.styles.fontStyle,
      textTransform:
        directoryRoot.styles.textTransform === "default"
          ? textStyle.textTransform
          : directoryRoot.styles.textTransform,
    };
    const visibleBreadcrumbs = breadcrumbs
      .map((breadcrumb, originalIndex) => ({ breadcrumb, originalIndex }))
      .filter(({ originalIndex }) => {
        const isLast = originalIndex === breadcrumbs.length - 1;
        const isRootPage = breadcrumbs.length === 1;
        return includeCurrentPage || !isLast || isRootPage;
      });

    if (!visibleBreadcrumbs.length) {
      if (!puck.isEditing) {
        return <></>;
      }

      return (
        <VisibilityWrapper
          liveVisibility={section.visibleOnLivePage}
          isEditing={puck.isEditing}
        >
          <AnalyticsScopeProvider
            name={`BoutiqueHospitalityBreadcrumbs${getAnalyticsScopeHash(id)}`}
          >
            <section
              className="ybh-breadcrumbs-shell"
              style={getSurfaceColorStyle(
                section.backgroundColor,
                streamDocument,
              )}
            >
              <style>{`
                .ybh-breadcrumbs-shell {
                  padding: 18px 20px 16px;
                }
                .ybh-breadcrumbs-track {
                  width: 100%;
                  max-width: var(--maxWidth-pageSection-contentWidth, 1200px);
                  margin: 0 auto;
                }
                .ybh-breadcrumbs-empty {
                  margin: 0;
                  font-family: var(--fontFamily-body-fontFamily, "DM Sans", sans-serif);
                  font-size: 0.8rem;
                  letter-spacing: 0.16em;
                  line-height: 1.4;
                  text-transform: uppercase;
                }
              `}</style>
              <div className="ybh-breadcrumbs-track">
                <p
                  className="ybh-breadcrumbs-empty"
                  style={{
                    color: defaultTextColor,
                    fontFamily: "Arial, Helvetica, sans-serif",
                    padding: "18px 24px",
                  }}
                >
                  No breadcrumbs available (section will be hidden on live
                  page). Create a directory to enable breadcrumbs.
                </p>
              </div>
            </section>
          </AnalyticsScopeProvider>
        </VisibilityWrapper>
      );
    }

    return (
      <VisibilityWrapper
        liveVisibility={section.visibleOnLivePage}
        isEditing={puck.isEditing}
      >
        <AnalyticsScopeProvider
          name={`BoutiqueHospitalityBreadcrumbs${getAnalyticsScopeHash(id)}`}
        >
          <style>{`
            .ybh-breadcrumbs-shell {
              padding: 18px 20px 16px;
            }
            .ybh-breadcrumbs-track {
              width: 100%;
              max-width: var(--maxWidth-pageSection-contentWidth, 1200px);
              margin: 0 auto;
            }
            .ybh-breadcrumbs-trail {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 10px 12px;
              margin: 0;
              padding: 0;
              list-style: none;
            }
            .ybh-breadcrumbs-item {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              min-width: 0;
            }
            .ybh-breadcrumbs-link,
            .ybh-breadcrumbs-current {
              font-family: var(--fontFamily-body-fontFamily, "DM Sans", sans-serif);
              font-size: 0.8rem;
              line-height: 1.4;
              letter-spacing: 0.18em;
              text-transform: uppercase;
            }
            .ybh-breadcrumbs-link {
              text-decoration: none;
              transition:
                color 160ms ease,
                opacity 160ms ease;
            }
            .ybh-breadcrumbs-link:hover {
              opacity: 0.72;
            }
            .ybh-breadcrumbs-current {
              font-family: var(--fontFamily-h6-fontFamily, var(--fontFamily-body-fontFamily, "DM Sans", sans-serif));
              font-weight: 600;
            }
            .ybh-breadcrumbs-separator {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 0.75rem;
              line-height: 1;
              letter-spacing: 0.2em;
            }
            @media (max-width: 767px) {
              .ybh-breadcrumbs-shell {
                padding-top: 14px;
                padding-bottom: 14px;
              }
              .ybh-breadcrumbs-trail,
              .ybh-breadcrumbs-item {
                gap: 8px;
              }
            }
          `}</style>
          <section
            className="ybh-breadcrumbs-shell"
            style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
          >
            <div className="ybh-breadcrumbs-track">
              <ol className="ybh-breadcrumbs-trail">
                {visibleBreadcrumbs.map(
                  ({ breadcrumb, originalIndex }, visibleIndex) => {
                  const isRoot = originalIndex === 0;
                  const isCurrentPage =
                    originalIndex === breadcrumbs.length - 1 &&
                    (includeCurrentPage || breadcrumbs.length === 1);
                  const href = relativePrefixToRoot
                    ? `${relativePrefixToRoot}${breadcrumb.slug ?? ""}`
                    : (breadcrumb.slug ?? "");
                  let label = breadcrumb.name ?? "";

                  if (isCurrentPage && currentPageLabel) {
                    label = currentPageLabel;
                  }
                  if (isRoot && resolvedRootLabel) {
                    label = resolvedRootLabel;
                  }

                  return (
                    <li
                      key={`${breadcrumb.slug ?? "breadcrumb"}-${originalIndex}`}
                      className="ybh-breadcrumbs-item"
                    >
                      {visibleIndex > 0 ? (
                        <span
                          className="ybh-breadcrumbs-separator"
                          aria-hidden
                          style={{ color: separatorColor }}
                        >
                          /
                        </span>
                      ) : null}
                      {isCurrentPage ? (
                        <EntityField
                          displayName="Current Page"
                          fieldId="name"
                          constantValueEnabled={false}
                        >
                          <span
                            aria-current="page"
                            className="ybh-breadcrumbs-current"
                            style={{
                              ...textStyle,
                              color: currentPageColor,
                            }}
                          >
                            {label}
                          </span>
                        </EntityField>
                      ) : isRoot ? (
                        <EntityField
                          displayName="Directory Root"
                          fieldId={directoryRoot.text.field}
                          constantValueEnabled={
                            directoryRoot.text.constantValueEnabled
                          }
                        >
                          <Link
                            className="ybh-breadcrumbs-link"
                            cta={{ link: href, linkType: "URL" }}
                            eventName={`breadcrumb${visibleIndex}`}
                            style={{
                              ...rootTextStyle,
                              color: rootLabelColor,
                            }}
                          >
                            {label}
                          </Link>
                        </EntityField>
                      ) : (
                        <Link
                          className="ybh-breadcrumbs-link"
                          cta={{ link: href, linkType: "URL" }}
                          eventName={`breadcrumb${visibleIndex}`}
                          style={{
                            ...textStyle,
                            color: trailColor,
                          }}
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                  },
                )}
              </ol>
            </div>
          </section>
        </AnalyticsScopeProvider>
      </VisibilityWrapper>
    );
  };

export const BoutiqueHospitalityBreadcrumbs: YextComponentConfig<BoutiqueHospitalityBreadcrumbsProps> =
  {
    label: "Breadcrumbs",
    fields: BreadcrumbsFields,
    defaultProps: {
      section: {
        visibleOnLivePage: true,
        backgroundColor: {
          selectedColor: "palette-tertiary",
          contrastingColor: "palette-tertiary-contrast",
        },
      },
      directoryRoot: {
        text: {
          field: "",
          constantValue: "All Locations",
          constantValueEnabled: true,
        },
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
      includeCurrentPage: true,
      trailStyles: {
        styles: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "uppercase",
        },
        fontColor: undefined,
        currentPageColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
        separatorColor: {
          selectedColor: "palette-primary",
          contrastingColor: "palette-primary-contrast",
        },
      },
    },
    render: BoutiqueHospitalityBreadcrumbsComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityBreadcrumbs",
  displayName: "Breadcrumbs",
  description: "Breadcrumbs",
  pageSetTypes: ["ENTITY"],
};
