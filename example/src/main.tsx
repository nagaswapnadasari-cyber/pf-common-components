import React from "react";
import ReactDOM from "react-dom/client";
import {
  CommonComponentsI18nProvider,
  createCommonComponentsI18n,
} from "../../src/i18n/common-components-i18n";
import App from "./App";
import "./index.css";
import "../../src/global.css";

import commonEn from "../../src/locales/en/common.json";
import bxV1En from "../../src/locales/en/bx_v1.json";
import findCourseEn from "../../src/locales/en/course.find_course.json";

import commonEs from "../../src/locales/es-es/common.json";
import bxV1Es from "../../src/locales/es-es/bx_v1.json";
import findCourseEs from "../../src/locales/es-es/course.find_course.json";

async function bootstrap() {
  const i18n = await createCommonComponentsI18n({
    lng: "en",
    resources: {
      en: {
        common: commonEn,
        bx_v1: bxV1En,
        "course.find_course": findCourseEn,
      },
      "es-es": {
        common: commonEs,
        bx_v1: bxV1Es,
        "course.find_course": findCourseEs,
      },
    },
  });

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <CommonComponentsI18nProvider i18n={i18n}>
        <App />
      </CommonComponentsI18nProvider>
    </React.StrictMode>
  );
}

bootstrap();
