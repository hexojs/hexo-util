export interface InternalHighlightOptions {
  autoDetect?: boolean;
  caption?: string;
  firstLine?: number;
  gutter?: boolean;
  hljs?: boolean;
  lang?: string;
  language?: string; // for backward compatibility
  languageAttr?: boolean;
  mark?: number[];
  tab?: string;
  wrap?: boolean;
  stripIndent?: boolean;
}
