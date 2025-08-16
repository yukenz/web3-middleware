import * as z from "zod";

export const hexString = () => z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

export const stringBigInt = () => z.string().refine(
    (val) => {
        try {
            BigInt(val);
            return true
        } catch (err) {
            return false
        }
    },
    {message: "Invalid BigInt"}
)

