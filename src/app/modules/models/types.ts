import {AppUI, Template} from '@identy/identy-ocr';

export interface TemplateOption {
  name: string;
  selected: boolean;
  template: Template;
}

export interface AppUiOption {
  name: string;
  selected: boolean;
  appui: AppUI;
}

export type UiLocalization = {
  name: string,
  selected: boolean,
  localization: any;
}
