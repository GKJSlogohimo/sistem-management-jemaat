import type { JenisUnitGerejaValue } from "./schemas/unit-gereja.schema";

export const jenisUnitGerejaOptions: Array<{
  value: JenisUnitGerejaValue;
  label: string;
}> = [
  {
    value: "INDUK",
    label: "Induk",
  },
  {
    value: "SUB_INDUK",
    label: "Subinduk",
  },
];

export const jenisUnitGerejaLabels: Record<JenisUnitGerejaValue, string> = {
  INDUK: "Induk",
  SUB_INDUK: "Subinduk",
};
