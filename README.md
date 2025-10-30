# IDENTY OCR Web SDK Demo (Angular)

This demo integrates `@identy/identy-ocr@4.2.1-b01` with `@identy/identy-common@5.0.0` to capture Peru DNI (front and back) in Chrome using the browser camera or gallery.

## Prerequisites

- Node 16+ and a modern Chrome browser
- A valid IDENTY license (Base64) from License Manager
- `.npmrc` with JFrog credentials to install `@identy/*` packages

### .npmrc

Place this in project root (update with your credentials):

```
@identy:registry=https://<your-jfrog-host>/artifactory/api/npm/<repo>/
//<your-jfrog-host>/artifactory/api/npm/<repo>/:_authToken=<YOUR_TOKEN>
```

## Installation

```
npm ci
```

## Configuration

### License

- Set the Base64 license in `src/main.ts` (`LICENSE` constant) or pass it via env at runtime and read it before `preInitialize`.
- The SDK requires `CardOcrSDK.preInitialize(license)` to be called once, ideally before Angular bootstraps.

### Public Key URL (when needed)

- For local browser capture (no server decryption), you DO NOT need a public key URL. Call `preInitialize(license)` only.
- For "OCR Web SDK + IDENTY Web Server" (secure decryption on server), call `preInitialize(license, { URL: { url: '<PUBLIC_KEY_ENDPOINT>', headers: [...] } })` with your IDENTY Web Server public key endpoint.
- The `assets/keys/mock-public.pem` is only useful for mock/testing or when pointing to a local dev server; it is not needed for local-only processing.

## How it works (high-level)

- `preInitialize(license)` validates license and prepares internal resources.
- In the component, a user gesture (button click) triggers `initialize()` which mounts the SDK UI and opens the camera (`<video>` element).
- `capture()` handles front and back detection for the configured `cardtype` and returns the extracted OCR payload (JSON) or an encrypted blob (if server mode).
- If you enable the server mode, the client encrypts and posts the blob to IDENTY Web Server, which decrypts/returns the JSON.

## Peru DNI configuration

The demo sets Peru DNI defaults on camera/gallery triggers:

- `cardtype: DocumentType.PERU_ID_CARD`
- `detectionModes: [CardDetectionMode.FRONT, CardDetectionMode.BACK]`
- `requiredTemplates: [Template.JPEG_95]`
- `barcodeCheck: true`

These are applied in `SdkRunComponent.triggerCamera()` and `triggerGallery()`.

## Avoiding AbortError: video removed during play()

Chrome throws `AbortError: The play() request was interrupted because the media was removed from the document` if the `<video>` element is detached while `MediaStream` is starting/playing. This commonly happens when:

- The component unmounts or route changes during capture
- A modal or conditional template removes the container the SDK mounted into

Fixes applied:

- The SDK is initialized and `capture()` is invoked only after a user gesture (button click)
- `ngOnDestroy` now aborts and destroys the SDK instance to stop the stream cleanly
- Capture buttons do not toggle away the SDK container during capture

## Run

```
npm start
```

Then open Chrome, allow camera permissions, and click Camera or Gallery to capture Peru DNI front and back.

## Files updated

- `src/main.ts`: call `CardOcrSDK.preInitialize(license)` without URL for local mode
- `src/app/components/sdk-run/sdk-run.component.ts`:
  - Add `ngOnDestroy` to abort/destroy SDK cleanly
  - Force Peru DNI defaults in `triggerCamera/triggerGallery`

## Switch to Secure Decryption (server mode) [Optional]

1. Provide your IDENTY Web Server public key endpoint in `preInitialize`:
   ```ts
   CardOcrSDK.preInitialize(LICENSE, {
     URL: { url: 'https://<identy-server>/api/v1/pub_key', headers: [...] }
   });
   ```
2. Use the encrypted blob path in your component and POST it to your IDENTY Web Server `/api/v1/process` endpoint.

## Internals and License Flow

- The SDK validates the license locally during `preInitialize`.
- In server mode, the SDK uses the server public key to encrypt the payload and the IDENTY Web Server decrypts it.
- In local mode, all processing stays in-browser; no data leaves the device.
