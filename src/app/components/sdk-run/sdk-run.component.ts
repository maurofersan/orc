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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK],
      cardtype: DocumentType.PERU_ID_CARD,
      // requiredTemplates: [Template.JPEG_95],
      barcodeCheck: true,
      transaction: { type: TransactionMode.CAPTURE },
      selectAsFile: false, // camera
      allowClose: true,
      debug: false,
      skipSupportCheck: true,
      showOrientationDialog: false,
      useFlash: true,
      silentInit: true,
    };

    const sdk = new CardOcrSDK(options);
    this.sdk = sdk;

    try {
      await sdk.initialize();
      const json = await sdk.capture();
      this.result = json;
    } catch (err: any) {
      this.error =
        err?.getLocalizedString?.() || err?.message || "Capture error";
    } finally {
      this.disabled = false;
      this.isCapturing = false;
    }
  }
}
