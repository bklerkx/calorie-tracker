// Barcodescanner met ZXing (F1). iOS Safari heeft geen BarcodeDetector, dus we decoderen zelf.
// De bibliotheek wordt pas geladen als de camera opent, zodat Vandaag snel blijft (N1).

export interface Scanner {
  stop(): void;
}

export async function startScanner(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  /** Codes die (nog) genegeerd moeten worden, bijv. het product dat net is toegevoegd. */
  ignore: (code: string) => boolean = () => false,
): Promise<Scanner> {
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
    import('@zxing/browser'),
    import('@zxing/library'),
  ]);

  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ]);
  const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 80, delayBetweenScanSuccess: 300 });

  // Nodig voor inline afspelen in iOS (ook vanaf het beginscherm)
  video.setAttribute('playsinline', '');
  video.muted = true;

  let last = '';
  let done = false;
  const controls = await reader.decodeFromConstraints(
    {
      audio: false,
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
    },
    video,
    (result) => {
      if (!result || done) return;
      const code = result.getText();
      if (ignore(code)) return;
      // Twee keer achter elkaar dezelfde code: voorkomt misgelezen cijfers
      if (code === last) {
        done = true;
        onCode(code);
      }
      last = code;
    },
  );
  return {
    stop() {
      done = true;
      controls.stop();
    },
  };
}
