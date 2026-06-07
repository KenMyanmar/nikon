/**
 * Brand configuration for this storefront deployment.
 *
 * This file is the single point of customization between the generic
 * "Myanmar HoReCa B2B" template and a specific client's storefront.
 * Every customer-facing brand reference in the UI (and the email
 * templates' BRAND_NAME variable) is sourced from these constants.
 *
 * To deploy for a new client, replace every "{TOKEN}" literal below
 * with the client's real values. Nothing else in the codebase should
 * need to change.
 *
 * See TEMPLATE.md at the repo root for the full token checklist.
 */
export const BRAND = {
  name: "{BRAND_NAME}",
  address: "{ADDRESS}",
  phone: "{PHONE}",
  email: "{EMAIL}",
  socials: {
    facebook: "{FACEBOOK_URL}",
    instagram: "{INSTAGRAM_URL}",
    messenger: "{MESSENGER_URL}",
    whatsapp: "{WHATSAPP_URL}",
  },
  trustPillars: [
    { title: "{TRUST_PILLAR_1}", tagline: "{TRUST_PILLAR_1_TAGLINE}" },
    { title: "{TRUST_PILLAR_2}", tagline: "{TRUST_PILLAR_2_TAGLINE}" },
    { title: "{TRUST_PILLAR_3}", tagline: "{TRUST_PILLAR_3_TAGLINE}" },
  ] as const,
  tagline: "Myanmar's procurement platform for hotels, restaurants, and cafes",
  legalEntity: "{LEGAL_ENTITY}",
} as const;

export const TEMPLATE = {
  version: "1.0",
  family: "myanmar-horeca-b2b",
} as const;
