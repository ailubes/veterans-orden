// .tina/config.ts
import { defineConfig } from "tinacms";
var routeMap = {
  "about": "/about",
  "mission": "/mission",
  "governance": "/governance",
  "governance-president": "/governance/president",
  "governance-vice-president": "/governance/vice-president",
  "governance-council": "/governance/council",
  "honor-court": "/honor-court",
  "code-of-honor": "/code-of-honor",
  "directions": "/directions",
  "join": "/join",
  "join-procedure": "/join/procedure",
  "support": "/support",
  "support-partnership": "/support/partnership",
  "help-request": "/help-request",
  "documents": "/documents",
  "transparency": "/transparency",
  "commanderies": "/commanderies",
  "media": "/media",
  "faq": "/faq"
};
var config_default = defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || "main",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "pages",
        label: "\u0421\u0442\u043E\u0440\u0456\u043D\u043A\u0438 (\u0421\u0442\u0430\u0442\u0438\u0447\u043D\u0456)",
        path: "content/pages",
        format: "mdx",
        ui: {
          router: (props) => {
            if (props && props.document && props.document._sys && props.document._sys.filename) {
              return routeMap[props.document._sys.filename] || `/${props.document._sys.filename}`;
            }
            return "/";
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A (UA)",
            required: true,
            description: "\u041E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438 \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u043E\u044E"
          },
          {
            type: "string",
            name: "titleEn",
            label: "Title (EN)",
            description: "Page title in English"
          },
          {
            type: "string",
            name: "label",
            label: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F",
            description: '\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F \u0434\u043B\u044F PageHeader \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 (\u043D\u0430\u043F\u0440\u0438\u043A\u043B\u0430\u0434: "\u0425\u0422\u041E \u041C\u0418", "\u0423\u041F\u0420\u0410\u0412\u041B\u0406\u041D\u041D\u042F")'
          },
          {
            type: "string",
            name: "description",
            label: "\u041E\u043F\u0438\u0441 (UA)",
            ui: {
              component: "textarea"
            },
            description: "\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u043E\u043F\u0438\u0441 \u0434\u043B\u044F PageHeader \u0442\u0430 SEO"
          },
          {
            type: "string",
            name: "descriptionEn",
            label: "Description (EN)",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "\u041E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442 (UA)",
            isBody: true,
            description: "\u041E\u0441\u043D\u043E\u0432\u043D\u0438\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442 \u0441\u0442\u043E\u0440\u0456\u043D\u043A\u0438 \u0443\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u043E\u044E",
            templates: [
              {
                name: "ValueCard",
                label: "\u041A\u0430\u0440\u0442\u043A\u0430 \u0426\u0456\u043D\u043D\u043E\u0441\u0442\u0456",
                fields: [
                  {
                    name: "title",
                    label: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A",
                    type: "string",
                    required: true
                  },
                  {
                    name: "description",
                    label: "\u041E\u043F\u0438\u0441",
                    type: "string",
                    ui: {
                      component: "textarea"
                    },
                    required: true
                  }
                ]
              },
              {
                name: "ProgramCard",
                label: "\u041A\u0430\u0440\u0442\u043A\u0430 \u041F\u0440\u043E\u0433\u0440\u0430\u043C\u0438",
                fields: [
                  {
                    name: "title",
                    label: "\u041D\u0430\u0437\u0432\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0438",
                    type: "string",
                    required: true
                  },
                  {
                    name: "description",
                    label: "\u041E\u043F\u0438\u0441",
                    type: "string",
                    ui: {
                      component: "textarea"
                    },
                    required: true
                  },
                  {
                    name: "icon",
                    label: "\u0406\u043A\u043E\u043D\u043A\u0430",
                    type: "string",
                    description: "\u041D\u0430\u0437\u0432\u0430 \u0456\u043A\u043E\u043D\u043A\u0438 \u0430\u0431\u043E emoji"
                  }
                ]
              },
              {
                name: "GovernanceRole",
                label: "\u0420\u043E\u043B\u044C \u0432 \u0423\u043F\u0440\u0430\u0432\u043B\u0456\u043D\u043D\u0456",
                fields: [
                  {
                    name: "role",
                    label: "\u041F\u043E\u0441\u0430\u0434\u0430",
                    type: "string",
                    required: true
                  },
                  {
                    name: "name",
                    label: "\u0406\u043C'\u044F",
                    type: "string"
                  },
                  {
                    name: "description",
                    label: "\u041E\u043F\u0438\u0441 \u0440\u043E\u043B\u0456",
                    type: "string",
                    ui: {
                      component: "textarea"
                    }
                  }
                ]
              }
            ]
          },
          {
            type: "rich-text",
            name: "bodyEn",
            label: "Main Content (EN)",
            description: "Page content in English (optional)"
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
