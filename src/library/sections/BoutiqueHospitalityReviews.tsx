import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  EntityField,
  getAggregateRating,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  resolveComponentData,
  ThemeColor,
  useDocument,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
  msg,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { getTextStyle } from "../shared/sectionStyles";

type ReviewItem = {
  authorName?: string;
  rating?: number;
  content?: string;
  reviewDate?: string;
};

const renderRatingStars = (rating?: number): string => {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return `${"★".repeat(filledStars)}${"☆".repeat(5 - filledStars)}`;
};

type ReviewsDocument = {
  locale?: string;
  ref_reviewsAgg?: {
    publisher?: string;
    topReviews?: ReviewItem[];
  }[];
};

type BoutiqueHospitalityReviewsProps = {
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
};

const editorSampleReviews: ReviewItem[] = [
  {
    authorName: "Guest Review",
    rating: 5,
    content:
      "Beautiful property, thoughtful service, and a perfect location for exploring the city.",
  },
  {
    authorName: "Guest Review",
    rating: 5,
    content:
      "The room was comfortable, the staff was warm, and every detail felt intentional.",
  },
  {
    authorName: "Guest Review",
    rating: 4,
    content:
      "A memorable stay with elegant design, great recommendations, and easy access to local favorites.",
  },
];

const ReviewsFields: YextFields<BoutiqueHospitalityReviewsProps> = {
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
      backgroundColor: { label: msg("fields.backgroundColor", "Background Color"), type: "basicSelector", options: "BACKGROUND_COLOR" },
      cardBackgroundColor: { label: msg("fields.cardBackgroundColor", "Card Background Color"), type: "basicSelector", options: "BACKGROUND_COLOR" },
    },
  },
  heading: {
    label: msg("fields.heading", "Heading"),
    type: "object",
    objectFields: {
      text: { type: "entityField", label: msg("fields.text", "Text"), filter: { types: ["type.string"] } },
      styles: { label: msg("fields.textStyles", "Text Styles"), type: "styledText" },
      fontColor: { label: msg("fields.fontColor", "Font Color"), type: "basicSelector", options: "SITE_COLOR" },
    },
  },
};

const BoutiqueHospitalityReviewsComponent: PuckComponent<BoutiqueHospitalityReviewsProps> = ({ id, section, heading, puck }) => {
  const streamDocument = useDocument<ReviewsDocument>();
  const { t } = useTranslation();
  const locale = streamDocument.locale ?? "en";
  const resolvedHeading = resolveComponentData(heading.text, locale, streamDocument, { output: "plainText" }) || "";
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);
  const firstPartyAggregate = streamDocument.ref_reviewsAgg?.find((aggregate) => aggregate.publisher === "FIRSTPARTY");
  const reviews = firstPartyAggregate?.topReviews ?? [];
  const visibleReviews = reviews.length ? reviews : puck.isEditing ? editorSampleReviews : [];
  const displayedAverageRating = reviews.length ? (averageRating ?? 0) : 4.8;
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(getDefaultForegroundColor(section.backgroundColor, streamDocument));
  const sectionTextColor = getThemeColorCssValue(getDefaultForegroundColor(section.backgroundColor, streamDocument));
  const cardTextColor = getThemeColorCssValue(getDefaultForegroundColor(section.cardBackgroundColor, streamDocument));

  if (!visibleReviews.length) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityReviews${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-reviews-shell {
            padding: 40px 20px;
          }
          .ybh-reviews-track {
            max-width: 1200px;
            margin: 0 auto;
          }
          .ybh-reviews-header {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 20px;
            align-items: center;
            margin-bottom: 24px;
          }
          .ybh-reviews-title {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .ybh-reviews-line {
            width: 28px;
            height: 1px;
            background: var(--colors-palette-primary);
          }
          .ybh-reviews-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
          }
          .ybh-reviews-grid {
            display: grid;
            gap: 20px;
          }
          .ybh-reviews-card {
            border: 1px solid currentColor;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          @media (min-width: 900px) {
            .ybh-reviews-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
        `}</style>
        <section
          className="ybh-reviews-shell"
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-reviews-track">
            <div className="ybh-reviews-header">
              <div className="ybh-reviews-title">
                <span className="ybh-reviews-line" aria-hidden />
                <EntityField
                  displayName="Heading"
                  fieldId={heading.text.field}
                  constantValueEnabled={heading.text.constantValueEnabled}
                >
                  <h2
                    className="ybh-reviews-heading-text"
                    style={{
                      ...getTextStyle(heading.styles),
                      color: headingColor,
                    }}
                  >
                    {resolvedHeading}
                  </h2>
                </EntityField>
              </div>
              {visibleReviews.length ? (
                <div style={{ color: sectionTextColor }}>
                  {t("ratingFromGuestReviews", {
                    defaultValue:
                      "{{rating}} {{stars}} from {{count}} guest reviews",
                    rating: displayedAverageRating.toFixed(1),
                    stars: renderRatingStars(displayedAverageRating),
                    count: reviews.length
                      ? reviewCount
                      : visibleReviews.length,
                  })}
                </div>
              ) : null}
            </div>
            <div className="ybh-reviews-grid">
              {visibleReviews.slice(0, 3).map((review, index) => (
                <article
                  key={`${review.authorName ?? "review"}-${index}`}
                  className="ybh-reviews-card"
                  style={getSurfaceColorStyle(
                    section.cardBackgroundColor,
                    streamDocument,
                  )}
                >
                  <div>{"★".repeat(Math.round(review.rating ?? 5))}</div>
                  <p style={{ margin: 0, color: cardTextColor }}>
                    {review.content ?? ""}
                  </p>
                  <div>
                    {review.authorName
                      ? `- ${review.authorName}`
                      : "Guest Review"}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityReviews: YextComponentConfig<BoutiqueHospitalityReviewsProps> = {
  label: "Reviews",
  fields: ReviewsFields,
  defaultProps: {
    section: {
      visibleOnLivePage: true,
      backgroundColor: { selectedColor: "palette-tertiary", contrastingColor: "palette-tertiary-contrast" },
      cardBackgroundColor: { selectedColor: "palette-tertiary", contrastingColor: "palette-tertiary-contrast" },
    },
    heading: {
      text: { field: "", constantValue: "What Guests Are Saying", constantValueEnabled: true },
      styles: { fontFamily: "default", fontSize: "default", fontWeight: "default", fontStyle: "default", textTransform: "default" },
      fontColor: undefined,
    },
  },
  render: BoutiqueHospitalityReviewsComponent,
};

export const config: SectionConfig = {
  id: "BoutiqueHospitalityReviews",
  displayName: "Reviews",
  description: "Reviews",
  pageSetTypes: ["ENTITY"],
};
