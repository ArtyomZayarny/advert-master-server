/**
 * Конфигурация для ReDoc UI
 */
export interface ReDocOptions {
  title?: string;
  theme?: {
    colors?: {
      primary?: {
        main?: string;
      };
      success?: {
        main?: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      warning?: {
        main?: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      error?: {
        main?: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      text?: {
        primary?: string;
        secondary?: string;
      };
      http?: {
        get?: string;
        post?: string;
        put?: string;
        patch?: string;
        delete?: string;
        basic?: string;
        link?: string;
        head?: string;
      };
    };
    typography?: {
      fontSize?: string;
      fontFamily?: string;
      fontWeightRegular?: string | number;
      fontWeightBold?: string | number;
      fontWeightLight?: string | number;
      lineHeight?: string | number;
      code?: {
        fontSize?: string;
        fontFamily?: string;
        lineHeight?: string | number;
        fontWeight?: string | number;
        color?: string;
        backgroundColor?: string;
        wrap?: boolean;
      };
      headings?: {
        fontFamily?: string;
        fontWeight?: string | number;
        lineHeight?: string | number;
      };
    };
    sidebar?: {
      backgroundColor?: string;
      textColor?: string;
      activeTextColor?: string;
      groupItems?: {
        activeTextColor?: string;
        activeBackgroundColor?: string;
        textColor?: string;
      };
      level1Items?: {
        activeTextColor?: string;
        activeBackgroundColor?: string;
        textColor?: string;
      };
      arrow?: {
        color?: string;
      };
    };
    rightPanel?: {
      backgroundColor?: string;
      textColor?: string;
    };
  };
  scrollYOffset?: number;
  hideDownloadButton?: boolean;
  disableSearch?: boolean;
  onlyRequiredInSamples?: boolean;
  sortOperationsAlphabetically?: boolean;
  sortTagsAlphabetically?: boolean;
  hideHostname?: boolean;
  expandSingleSchemaField?: boolean;
  jsonSampleExpandLevel?: number;
  hideSingleRequestSampleTab?: boolean;
  menuToggle?: boolean;
  nativeScrollbars?: boolean;
  pathInMiddlePanel?: boolean;
  hideFab?: boolean;
  requiredPropsFirst?: boolean;
  sortPropsAlphabetically?: boolean;
  showExtensions?: boolean | string[];
  hideSchemaPattern?: boolean;
  generatedPayloadSamplesMaxDepth?: number;
}

export const defaultReDocOptions: ReDocOptions = {
  title: 'Advert Master API',
  theme: {
    colors: {
      primary: {
        main: '#667eea',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff',
      },
      text: {
        primary: '#1f2937',
        secondary: '#6b7280',
      },
      http: {
        get: '#10b981',
        post: '#3b82f6',
        put: '#f59e0b',
        patch: '#8b5cf6',
        delete: '#ef4444',
        basic: '#6b7280',
        link: '#06b6d4',
        head: '#6366f1',
      },
    },
    typography: {
      fontSize: '14px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeightRegular: 400,
      fontWeightBold: 600,
      fontWeightLight: 300,
      lineHeight: 1.6,
      code: {
        fontSize: '13px',
        fontFamily: 'Monaco, "Courier New", monospace',
        lineHeight: 1.5,
        fontWeight: 400,
        color: '#e83e8c',
        backgroundColor: '#f8f9fa',
        wrap: false,
      },
      headings: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        lineHeight: 1.25,
      },
    },
    sidebar: {
      backgroundColor: '#ffffff',
      textColor: '#374151',
      activeTextColor: '#667eea',
      groupItems: {
        activeTextColor: '#667eea',
        activeBackgroundColor: '#f3f4f6',
        textColor: '#6b7280',
      },
      level1Items: {
        activeTextColor: '#667eea',
        activeBackgroundColor: '#f3f4f6',
        textColor: '#374151',
      },
      arrow: {
        color: '#9ca3af',
      },
    },
    rightPanel: {
      backgroundColor: '#f9fafb',
      textColor: '#374151',
    },
  },
  scrollYOffset: 0,
  hideDownloadButton: false,
  disableSearch: false,
  onlyRequiredInSamples: false,
  sortOperationsAlphabetically: false,
  sortTagsAlphabetically: true,
  hideHostname: false,
  expandSingleSchemaField: true,
  jsonSampleExpandLevel: 2,
  hideSingleRequestSampleTab: false,
  menuToggle: true,
  nativeScrollbars: false,
  pathInMiddlePanel: true,
  hideFab: false,
  requiredPropsFirst: true,
  sortPropsAlphabetically: false,
  showExtensions: true,
  hideSchemaPattern: false,
  generatedPayloadSamplesMaxDepth: 10,
};
