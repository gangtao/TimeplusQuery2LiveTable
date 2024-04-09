import type { CreateQueryRequestV1Beta2 } from "./swagger";
import { Env } from "./env";
// @ts-ignore
import { fetchEventSource } from "@microsoft/fetch-event-source";

export const createQueryV1beta2 = async (
  queryRequest: CreateQueryRequestV1Beta2,
  fetchOptions: any
) => {
  console.log(
    queryRequest,
    fetchOptions,
    Env().AuthKey(),
    Env().BuildUrl("v1beta2", "queries"),
    "request"
  );
  fetchEventSource(Env().BuildUrl("v1beta2", "queries"), {
    method: "POST",
    headers: {
      // DO NOT set `Accept` header here since `fetchEventSource` will automatically set it to be `text/event-stream`
      // Duplicated the `Accept` will cause some proxy fail (namely CYPRESS!!!)
      // Accept: 'text/event-stream',
      // "Content-Type": "application/json;charset=UTF-8",
      // "Cache-Control": "no-cache",
      "X-Api-Key": Env().AuthKey(),
    },
    body: JSON.stringify(queryRequest),
    onopen: async (response) => {
      console.log("on open ", response);
      if (
        response.ok &&
        response.headers.get("content-type") === "text/event-stream"
      ) {
        return; // everything's good
      } else {
        const errorMessage = await response.text();
        throw `${response.status}: ${errorMessage}`;
      }
    },
    openWhenHidden: true,
    onerror: (error) => {
      throw new Error(`${error.message}`);
    },
    ...fetchOptions,
  }).catch((error) => {
    console.log(error);
  });
};
