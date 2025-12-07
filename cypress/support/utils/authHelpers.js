/// <reference types="cypress" />
/* eslint-env cypress */

export const createJwt = (payloadOverrides = {}) => {
  const b64url = (o) =>
    btoa(JSON.stringify(o))
      .replace(/=+$/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "7",
    roles: ["buyer"],
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    ...payloadOverrides,
  };

  return `${b64url(header)}.${b64url(payload)}.signature`;
};

export const typeInByTestId = (testId, value) => {
  const selector = `[data-testid="${testId}"]`;
  cy.get(selector).clear();
  cy.get(selector).type(value);
};

export const hexToRgbCss = (hex) => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
};
