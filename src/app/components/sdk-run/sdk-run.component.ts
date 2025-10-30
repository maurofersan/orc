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
    const allowed = await this.ensureCameraPermission();
    if (!allowed) {
      this.disabled = false;
      this.isCapturing = false;
      return;
    }
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
      events: {
        onCardFaceCaptureSuccess: (face: string) => {
          return new Promise<void>((resolve) => {
            const banner = document.createElement("div");
            banner.style.position = "fixed";
            banner.style.top = "20px";
            banner.style.left = "50%";
            banner.style.transform = "translateX(-50%)";
            banner.style.zIndex = "999999";
            banner.style.padding = "10px 16px";
            banner.style.background = "#323232";
            banner.style.color = "#fff";
            banner.style.borderRadius = "6px";
            banner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
            banner.textContent = `Captured ${face} side`;
            document.body.appendChild(banner);
            setTimeout(() => {
              try {
                document.body.removeChild(banner);
              } catch {}
              resolve();
            }, 3000);
          });
        },
      },
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

  private async ensureCameraPermission(): Promise<boolean> {
    try {
      // Aviso temprano si está bloqueada explícitamente
      if (navigator.permissions && (navigator.permissions as any).query) {
        // @ts-ignore
        const status = await navigator.permissions.query({
          name: "camera" as any,
        });
        if (status.state === "denied") {
          alert(
            "⚠️ La cámara está bloqueada. Habilítala en el candado del navegador → Camera → Allow."
          );
          return false;
        }
      }
      // Fuerza el prompt de permisos y calienta el dispositivo
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch (e) {
      console.log("ensureCameraPermission::error", e);
      alert("⚠️ No se pudo abrir la cámara. Permite el acceso y reintenta.");
      return false;
    }
  }
}
