export type EntityId = string | number;

export interface CursorParams {
  limit?: number;
  cursor?: number;
}

export interface DataList<ResponseItem> {
  data: ResponseItem[];
}

export interface CursorPage<ResponseItem> extends DataList<ResponseItem> {
  nextCursor: number | null;
}
