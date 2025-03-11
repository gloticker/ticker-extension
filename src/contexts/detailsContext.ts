import { createContext } from "react";
import { DetailsContextType } from "../types/details";

export const DetailsContext = createContext<DetailsContextType | undefined>(undefined);
