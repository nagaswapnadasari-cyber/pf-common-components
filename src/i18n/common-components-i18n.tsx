import * as React from "react";
import i18next, {
  type InitOptions,
  type Resource,
  type i18n as I18nInstance,
} from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

export const commonComponentsNamespaces = [
  "common",
  "bx_v1",
  "course.find_course",
] as const;

export type CommonComponentsNamespace =
  (typeof commonComponentsNamespaces)[number];

export async function createCommonComponentsI18n({
  lng = "en",
  fallbackLng = "en",
  resources,
  defaultNS = "common",
  ns = [...commonComponentsNamespaces],
  ...rest
}: Omit<InitOptions, "resources" | "lng" | "fallbackLng" | "ns" | "defaultNS"> & {
  lng?: string;
  fallbackLng?: string;
  resources: Resource;
  defaultNS?: CommonComponentsNamespace;
  ns?: CommonComponentsNamespace[];
}) {
  const instance = i18next.createInstance();

  await instance.use(initReactI18next).init({
    lng,
    fallbackLng,
    resources,
    ns,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
    ...rest,
  });

  return instance;
}

export function CommonComponentsI18nProvider({
  children,
  i18n,
}: {
  children: React.ReactNode;
  i18n: I18nInstance;
}) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
