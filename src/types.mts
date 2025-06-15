export interface Component {
  render: (props?: Record<string, any>) => string;
  defaultProps: Record<string, any>;
  react?: (defaultProps: Record<string, any>) => {
    component: (props: Record<string, any>) => string;
  };
}

export type ComponentMap = Map<string, Component>;

export interface PageConfig {
  title: string;
  description: string;
  styles?: string;
  scripts?: string;
  sections: PageSection[];
}

export interface PageSection {
  component: Component;
  props?: Record<string, any>;
  layout?: {
    order?: number;
    container?: string;
    className?: string;
  };
}

export interface ProcessedPageSection {
  component: string;
  styles?: string[];
  layout?: PageSection['layout'];
}

export interface ProcessedPageConfig {
  title: string;
  description: string;
  styles?: string;
  scripts?: string;
  sections: ProcessedPageSection[];
} 