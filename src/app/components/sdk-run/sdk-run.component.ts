import {
  Component,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  CardDetectionMode,
  CardOcrSDK,
  DocumentType,
  SdkOptionsType,
  Template,
  TransactionMode,
} from "@identy/identy-ocr";

@Component({
  selector: "app-sdk-run",
  templateUrl: "./sdk-run.component.html",
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SdkRunComponent implements OnDestroy {
  sdk: CardOcrSDK | null;
  disabled = false;
  result: any = null;
  error = "";
  isCapturing = false;
  constructor(private zone: NgZone) {}

  ngOnDestroy() {
    this.destroySdk();
  }

  private async destroySdk() {
    try {
      if (this.sdk) {
        await this.sdk.abort();
        await this.sdk.destroy();
        this.sdk = null;
      }
    } catch {}
  }

  async startCameraCapture() {
    this.disabled = true;
    this.result = null;
    this.error = "";
    this.isCapturing = true;
    // Try to detect blocked permission first
    try {
      // @ts-ignore
      if (navigator.permissions && navigator.permissions.query) {
        // @ts-ignore
        const status = await navigator.permissions.query({
          name: "camera" as any,
        });
        if (status.state === "denied") {
          this.error =
            "Camera permission is blocked. Enable it in site settings and retry.";
          this.disabled = false;
          return;
        }
      }
    } catch {}

    // Flujo secuencial: initialize -> capture, sin runOutsideAngular
    const options: SdkOptionsType = {
      // detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK],
      // cardtype: DocumentType.PERU_ID_CARD,
      // // requiredTemplates: [Template.JPEG_95],
      // barcodeCheck: true,
      // transaction: { type: TransactionMode.CAPTURE },
      // selectAsFile: false, // camera
      // allowClose: false,
      // debug: true,
      // skipSupportCheck: false,
      // showOrientationDialog: false,
      // useFlash: false,
      // silentInit: false,
      //
      // detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK],
      // cardtype: DocumentType.PERU_ID_CARD,
      // barcodeCheck: true,
      // allowClose: false,
      // showOrientationDialog: false,
      // useFlash: false,
      // transaction: { type: TransactionMode.CAPTURE },
      // debug: true,
      //
      detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK],
      cardtype: DocumentType.PERU_ID_CARD,
      transaction: { type: TransactionMode.CAPTURE },
      allowClose: true,
      showOrientationDialog: true,
      useFlash: false,
      debug: false,
      skipSupportCheck: false,
    };

    const sdk = new CardOcrSDK(options);
    console.log("sdk::", sdk);
    this.sdk = sdk;

    // Use vendor-recommended onInit -> capture flow
    sdk.onInit = () => {
      sdk
        .capture()
        .then((json: any) => {
          console.log("json::result::", json);
          this.result = json;
          this.disabled = false;
          this.isCapturing = false;
        })
        .catch((err) => {
          console.log("error in capture()", err);
          this.error =
            err?.getLocalizedString?.() || err?.message || "Capture error";
          this.disabled = false;
          this.isCapturing = false;
        });
    };

    try {
      const initResult = await sdk.initialize();
      console.log("Ok in initialize()::", initResult);
    } catch (err: any) {
      console.log("error in initialize()::");
      this.error =
        err?.getLocalizedString?.() || err?.message || "Capture error";
    } finally {
      this.disabled = false;
      this.isCapturing = false;
    }
  }
}
