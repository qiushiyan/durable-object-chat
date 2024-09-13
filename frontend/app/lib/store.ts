import { atom } from "jotai";

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

const randomName = uniqueNamesGenerator({
  dictionaries: [adjectives, animals],
  separator: "-",
  length: 2,
});

export const nameAtom = atom(randomName);

export const roomsAtom = atom(["General", "Sports", "Gaming", "Music"]);
