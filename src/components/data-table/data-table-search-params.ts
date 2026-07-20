import { parseAsIndex, parseAsInteger, parseAsString } from "nuqs/server";

export const dataTableSearchParams = {
  q: parseAsString.withDefault(""),

  /*
   * Nilai internal:
   * pageIndex = 0
   *
   * Nilai URL:
   * page=1
   */
  page: parseAsIndex.withDefault(0),

  pageSize: parseAsInteger.withDefault(10),
};
