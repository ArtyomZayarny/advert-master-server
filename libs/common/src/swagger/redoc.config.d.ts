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
export declare const defaultReDocOptions: ReDocOptions;
