export type ComponentType = 'js' | 'jsx' | 'ts' | 'tsx' | 'html';

export interface ComponentOptions {
  name: string;
  type: ComponentType;
  path: string;
  props?: Record<string, any>;
}

export interface StyleOptions {
  type: 'css' | 'tailwind' | 'scss';
  path?: string;
  content?: string;
}

export interface PageSection {
  component: ComponentOptions;
  styles?: StyleOptions[];
  layout?: {
    order?: number;
    container?: string;
    className?: string;
  };
}

export interface PageConfig {
  sections: PageSection[];
  meta: {
    title: string;
    description: string;
    [key: string]: any;
  };
  styles?: StyleOptions[];
}

export interface ProcessedComponent {
  name: string;
  component: any;
  props?: Record<string, any>;
}

export interface ProcessedPageSection {
  component: ProcessedComponent;
  styles?: string[];
  layout?: PageSection['layout'];
}

export interface ProcessedPageConfig {
  sections: ProcessedPageSection[];
  meta: PageConfig['meta'];
  styles?: string[];
}

export interface PaulJSConfig {
  pages: Record<string, ProcessedPageConfig>;
  globalStyles?: StyleOptions[];
  typescript?: boolean;
  tailwind?: boolean;
} 