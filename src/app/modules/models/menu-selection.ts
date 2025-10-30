import {AppUI, Template, DocumentType, MandatoryFieldValue} from '@identy/identy-ocr';

export class MenuSelection {

  public enableAS: boolean;
  public showCaptureTraining: boolean;
  public fileSelection: boolean;
  public templates: Template[];
  public uiSelect: AppUI;
  public useFlash: boolean;
  public integrityCheck: boolean;
  public barcodeCheck: boolean;
  public card_type: DocumentType;
  public maxNumberAttempts: number;
  public mandatoryFields: Array<any>;
  public allowUploads: boolean;
  constructor() {}


}
