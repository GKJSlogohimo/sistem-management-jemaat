"use client";

type QueueAnnouncementOptions = {
  nomorAntrian: number | null;
  tujuan?: string;
  ulang?: number;
};

function getIndonesianVoice(synthesis: SpeechSynthesis) {
  const voices = synthesis.getVoices();

  return (
    voices.find((voice) => voice.lang.toLowerCase() === "id-id") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("id")) ??
    null
  );
}

function createUtterance(text: string, voice: SpeechSynthesisVoice | null) {
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = "id-ID";
  utterance.rate = 0.88;
  utterance.pitch = 1;
  utterance.volume = 1;

  if (voice) {
    utterance.voice = voice;
  }

  return utterance;
}

export function speakQueueAnnouncement({
  nomorAntrian,
  tujuan = "meja pelayanan",
  ulang = 2,
}: QueueAnnouncementOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  if (nomorAntrian === null || nomorAntrian <= 0) {
    return false;
  }

  const synthesis = window.speechSynthesis;

  /*
   * Hentikan pengumuman sebelumnya agar
   * suara tidak saling bertumpuk.
   */
  synthesis.cancel();

  const voice = getIndonesianVoice(synthesis);

  const text = `Nomor antrean ${nomorAntrian}, ` + `silakan menuju ${tujuan}.`;

  const repeatCount = Math.min(Math.max(ulang, 1), 3);

  for (let index = 0; index < repeatCount; index += 1) {
    const utterance = createUtterance(text, voice);

    synthesis.speak(utterance);
  }

  return true;
}

export function stopQueueAnnouncement() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
