import { defineConfig } from 'tinacms';

// Helper to generate route from filename
const routeMap: Record<string, string> = {
  'about': '/about',
  'mission': '/mission',
  'governance': '/governance',
  'governance-president': '/governance/president',
  'governance-vice-president': '/governance/vice-president',
  'governance-council': '/governance/council',
  'honor-court': '/honor-court',
  'code-of-honor': '/code-of-honor',
  'directions': '/directions',
  'join': '/join',
  'join-procedure': '/join/procedure',
  'support': '/support',
  'support-partnership': '/support/partnership',
  'help-request': '/help-request',
  'documents': '/documents',
  'transparency': '/transparency',
  'commanderies': '/commanderies',
  'media': '/media',
  'faq': '/faq',
};

export default defineConfig({
  branch: process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'pages',
        label: 'Сторінки (Статичні)',
        path: 'content/pages',
        format: 'mdx',
        ui: {
          router: (props) => {
            if (props && props.document && props.document._sys && props.document._sys.filename) {
              return routeMap[props.document._sys.filename] || `/${props.document._sys.filename}`;
            }
            return '/';
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Заголовок (UA)',
            required: true,
            description: 'Основний заголовок сторінки українською',
          },
          {
            type: 'string',
            name: 'titleEn',
            label: 'Title (EN)',
            description: 'Page title in English',
          },
          {
            type: 'string',
            name: 'label',
            label: 'Категорія',
            description: 'Категорія для PageHeader компонента (наприклад: "ХТО МИ", "УПРАВЛІННЯ")',
          },
          {
            type: 'string',
            name: 'description',
            label: 'Опис (UA)',
            ui: {
              component: 'textarea',
            },
            description: 'Короткий опис для PageHeader та SEO',
          },
          {
            type: 'string',
            name: 'descriptionEn',
            label: 'Description (EN)',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Основний контент (UA)',
            isBody: true,
            description: 'Основний контент сторінки українською',
            templates: [
              {
                name: 'ValueCard',
                label: 'Картка Цінності',
                fields: [
                  {
                    name: 'title',
                    label: 'Заголовок',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'description',
                    label: 'Опис',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                    required: true,
                  },
                ],
              },
              {
                name: 'ProgramCard',
                label: 'Картка Програми',
                fields: [
                  {
                    name: 'title',
                    label: 'Назва програми',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'description',
                    label: 'Опис',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                    required: true,
                  },
                  {
                    name: 'icon',
                    label: 'Іконка',
                    type: 'string',
                    description: 'Назва іконки або emoji',
                  },
                ],
              },
              {
                name: 'GovernanceRole',
                label: 'Роль в Управлінні',
                fields: [
                  {
                    name: 'role',
                    label: 'Посада',
                    type: 'string',
                    required: true,
                  },
                  {
                    name: 'name',
                    label: 'Ім\'я',
                    type: 'string',
                  },
                  {
                    name: 'description',
                    label: 'Опис ролі',
                    type: 'string',
                    ui: {
                      component: 'textarea',
                    },
                  },
                ],
              },
            ],
          },
          {
            type: 'rich-text',
            name: 'bodyEn',
            label: 'Main Content (EN)',
            description: 'Page content in English (optional)',
          },
        ],
      },
    ],
  },
});
