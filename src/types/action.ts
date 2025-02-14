type ServerActionError = {
  status: "error";
  error: string;
  redirect?: string;
};

type ServerActionSuccess<T> = {
  status: "success";
  data: T;
  message?: string;
  redirect?: string;
};

export type ServerAction<T> = ServerActionError | ServerActionSuccess<T>;
