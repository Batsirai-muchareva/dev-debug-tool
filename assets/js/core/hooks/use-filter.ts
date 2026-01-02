import { useState } from "react";

export const useFilter = () => {
    const [ filters, setPaths ] = useState<Record<string, Record<string, string>>>({});
}
