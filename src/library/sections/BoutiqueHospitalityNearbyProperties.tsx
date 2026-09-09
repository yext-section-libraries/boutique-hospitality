import type { SectionConfig } from "@yext/visual-editor";

import * as React from "react";
import type { PuckComponent } from "@puckeditor/core";
import { Address, AnalyticsScopeProvider, Link } from "@yext/pages-components";
import {
  EntityField,
  getAnalyticsScopeHash,
  getDefaultForegroundColor,
  getSurfaceColorStyle,
  getThemeColorCssValue,
  MapboxStaticMapComponent,
  mapboxStaticMapStyleOptions,
  mergeMeta,
  resolveComponentData,
  resolveUrlTemplate,
  ThemeColor,
  useDocument,
  useNearbyLocations,
  useTemplateProps,
  VisibilityWrapper,
  type StyledTextValue,
  type TranslatableString,
  type YextComponentConfig,
  type YextEntityField,
  type YextFields,
} from "@yext/visual-editor";
import { formatPhoneNumber } from "@yext/visual-editor/section-library-support";
import { getTextStyle } from "../shared/sectionStyles";

type BoutiqueHospitalityNearbyPropertiesProps = {
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
  radius: number;
  limit: number;
  map: {
    coordinate: YextEntityField<{ latitude: number; longitude: number }>;
    mapStyle: string;
    zoom: number;
    height?: string;
  };
};

type NearbyStreamDocument = {
  locale?: string;
  address?: { line1?: string };
  yextDisplayCoordinate?: { latitude?: number; longitude?: number };
};

const defaultTextStyles: StyledTextValue = {
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
};

const getMilesBetween = (
  a?: { latitude?: number; longitude?: number },
  b?: { latitude?: number; longitude?: number },
) => {
  if (
    a?.latitude === undefined ||
    a?.longitude === undefined ||
    b?.latitude === undefined ||
    b?.longitude === undefined
  ) {
    return null;
  }
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const distance = 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
  return `${distance.toFixed(1)} miles away`;
};

const NearbyFields: YextFields<BoutiqueHospitalityNearbyPropertiesProps> = {
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
  radius: {
    label: "Radius",
    type: "number",
  },
  limit: {
    label: "Limit",
    type: "number",
  },
  map: {
    label: "Map",
    type: "object",
    objectFields: {
      coordinate: {
        type: "entityField",
        label: "Coordinates",
        filter: { types: ["type.coordinate"] },
      },
      mapStyle: {
        label: "Mapbox Map Style",
        type: "select",
        options: mapboxStaticMapStyleOptions,
      },
      zoom: { label: "Zoom", type: "number", min: 0, max: 22 },
      height: { label: "Height", type: "text" },
    },
  },
};

const BoutiqueHospitalityNearbyPropertiesComponent: PuckComponent<
  BoutiqueHospitalityNearbyPropertiesProps
> = ({ id, heading, radius, limit, map, section, puck }) => {
  const streamDocument = useDocument<NearbyStreamDocument>();
  const locale = streamDocument.locale ?? "en";
  const { relativePrefixToRoot } = useTemplateProps<{
    relativePrefixToRoot?: string;
  }>();
  const resolvedHeading =
    resolveComponentData(heading.text, locale, streamDocument, {
      output: "plainText",
    }) || "";
  const headingColor =
    getThemeColorCssValue(heading.fontColor) ??
    getThemeColorCssValue(
      getDefaultForegroundColor(section.backgroundColor, streamDocument),
    );
  const cardTextColor = getThemeColorCssValue(
    getDefaultForegroundColor(section.cardBackgroundColor, streamDocument),
  );
  const coordinate =
    resolveComponentData(map.coordinate, locale, streamDocument) ??
    streamDocument.yextDisplayCoordinate;
  const hasCoordinate =
    coordinate?.latitude !== undefined && coordinate?.longitude !== undefined;
  const enabled = hasCoordinate && Boolean(radius) && Boolean(limit);
  const showMap = hasCoordinate;
  const { data: nearbyLocationsData, status } = useNearbyLocations({
    streamDocument,
    latitude: coordinate?.latitude,
    longitude: coordinate?.longitude,
    radiusMi: radius,
    limit,
    enabled,
  });
  const docs = nearbyLocationsData?.response?.docs ?? [];
  const hasNearbyLocations = docs.length > 0;
  const shouldRenderSection = puck.isEditing || showMap || hasNearbyLocations;

  if (!shouldRenderSection) {
    return <></>;
  }

  return (
    <VisibilityWrapper
      liveVisibility={section.visibleOnLivePage}
      isEditing={puck.isEditing}
    >
      <AnalyticsScopeProvider
        name={`BoutiqueHospitalityNearbyProperties${getAnalyticsScopeHash(id)}`}
      >
        <style>{`
          .ybh-nearby-shell {
            padding: 40px 20px;
          }
          .ybh-nearby-track {
            max-width: 1200px;
            margin: 0 auto;
          }
          .ybh-nearby-heading {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            min-width: 0;
          }
          .ybh-nearby-line {
            width: 28px;
            height: 1px;
            background: var(--colors-palette-primary);
          }
          .ybh-nearby-heading-text {
            margin: 0;
            color: inherit;
            font-family: var(--fontFamily-h2-fontFamily, "Fraunces", serif);
            font-size: clamp(2.25rem, 3.75vw, 3.25rem);
            line-height: 0.95;
            min-width: 0;
          }
          .ybh-nearby-grid {
            display: grid;
            gap: 18px;
          }
          .ybh-nearby-card {
            border: 1px solid currentColor;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .ybh-nearby-link {
            text-decoration: none;
          }
          .ybh-nearby-link:hover {
            text-decoration: underline;
          }
          .ybh-nearby-map {
            margin-top: 24px;
            height: 280px;
            overflow: hidden;
            border-radius: 10px;
          }
          .ybh-nearby-map .mapbox-static-map-shell,
          .ybh-nearby-map .mapbox-static-map-picture,
          .ybh-nearby-map .mapbox-static-map-image {
            width: 100%;
            height: 100%;
          }
          .ybh-nearby-map .mapbox-static-map-image {
            object-fit: cover;
            object-position: center;
          }
          @media (min-width: 900px) {
            .ybh-nearby-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr));
            }
          }
          @media (max-width: 899px) {
            .ybh-nearby-heading-text {
              max-width: 100%;
              font-size: clamp(1.9rem, 8vw, 2.6rem);
            }
          }
        `}</style>
        <section
          className="ybh-nearby-shell"
          style={getSurfaceColorStyle(section.backgroundColor, streamDocument)}
        >
          <div className="ybh-nearby-track">
            {(puck.isEditing || showMap || hasNearbyLocations) && (
              <div>
                <div className="ybh-nearby-heading">
                  <span className="ybh-nearby-line" aria-hidden />
                  <EntityField
                    displayName="Heading"
                    fieldId={heading.text.field}
                    constantValueEnabled={heading.text.constantValueEnabled}
                  >
                    <h2
                      className="ybh-nearby-heading-text"
                      style={{
                        ...getTextStyle(heading.styles),
                        color: headingColor,
                      }}
                    >
                      {resolvedHeading}
                    </h2>
                  </EntityField>
                </div>
                {status === "pending" && puck.isEditing ? (
                  <p
                    style={{
                      color: getThemeColorCssValue(
                        getDefaultForegroundColor(
                          section.backgroundColor,
                          streamDocument,
                        ),
                      ),
                    }}
                  >
                    Loading nearby locations
                  </p>
                ) : hasNearbyLocations ? (
                  <>
                    <div className="ybh-nearby-grid">
                      {docs.slice(0, limit).map((locationData, index) => {
                        const resolvedUrl = resolveUrlTemplate(
                          mergeMeta(locationData, streamDocument),
                          relativePrefixToRoot ?? "",
                        );
                        const distanceText = getMilesBetween(
                          coordinate,
                          locationData.yextDisplayCoordinate,
                        );
                        const phone =
                          typeof locationData.mainPhone === "string"
                            ? locationData.mainPhone
                            : "";
                        const formattedPhone = phone
                          ? formatPhoneNumber(phone)
                          : "";
                        return (
                          <article
                            key={`${locationData.id ?? locationData.name ?? index}`}
                            className="ybh-nearby-card"
                            style={{
                              backgroundColor: getThemeColorCssValue(
                                section.cardBackgroundColor,
                              ),
                              color: cardTextColor,
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                color: cardTextColor,
                              }}
                            >
                              {locationData.name ?? "Nearby Location"}
                            </h3>
                            {locationData.address ? (
                              <Address
                                address={locationData.address}
                                showRegion
                                showCountry={false}
                              />
                            ) : null}
                            {formattedPhone ? (
                              <span>{formattedPhone}</span>
                            ) : null}
                            {distanceText ? <span>{distanceText}</span> : null}
                            <Link
                              className="ybh-nearby-link"
                              cta={{ link: resolvedUrl, linkType: "URL" }}
                              eventName={`nearbyGetDirections${index}`}
                              style={{ color: cardTextColor }}
                            >
                              Get Directions
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : puck.isEditing ? (
                  <p
                    style={{
                      color: getThemeColorCssValue(
                        getDefaultForegroundColor(
                          section.backgroundColor,
                          streamDocument,
                        ),
                      ),
                    }}
                  >
                    No nearby locations found for this location
                  </p>
                ) : null}
              </div>
            )}
            {showMap ? (
              <EntityField
                displayName="Map Coordinates"
                fieldId={map.coordinate.field}
                constantValueEnabled={map.coordinate.constantValueEnabled}
              >
                <div className="ybh-nearby-map">
                  <MapboxStaticMapComponent
                    {...map}
                    id={`${id}-map`}
                    puck={puck}
                  />
                </div>
              </EntityField>
            ) : null}
          </div>
        </section>
      </AnalyticsScopeProvider>
    </VisibilityWrapper>
  );
};

export const BoutiqueHospitalityNearbyProperties: YextComponentConfig<BoutiqueHospitalityNearbyPropertiesProps> =
  {
    label: "Nearby Properties",
    fields: NearbyFields,
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
          constantValue: "Nearby Hotels & Sister Properties",
          constantValueEnabled: true,
        },
        styles: defaultTextStyles,
        fontColor: undefined,
      },
      radius: 10,
      limit: 3,
      map: {
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: { latitude: 0, longitude: 0 },
          constantValueEnabled: false,
        },
        mapStyle: "streets-v12",
        zoom: 12,
        height: "100%",
      },
    },
    render: BoutiqueHospitalityNearbyPropertiesComponent,
  };

export const config: SectionConfig = {
  id: "BoutiqueHospitalityNearbyProperties",
  displayName: "Nearby Properties",
  description: "Nearby Properties",
  pageSetTypes: ["ENTITY"],
};
