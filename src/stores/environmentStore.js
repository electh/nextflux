import {atom} from "nanostores";

export const environment = atom({
  singleServerMode: false,
  defaultServerUrl: undefined
});
