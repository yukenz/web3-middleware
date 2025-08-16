import type {NextApiRequest, NextApiResponse} from "next";
import {getPublicClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError} from "@/lib/error";
import {erc20Abi} from "@/abi/erc20";
import {jsonToString} from "@/lib/utils";

const HexAddress = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const ERC20TotalSupplyRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    erc20Address: HexAddress,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    try {

        const {
            erc20Address,
            chain
        } = ERC20TotalSupplyRequest.parse(req.body);

        const publicClient = getPublicClient({chain});

        const data = await publicClient.readContract({
            address: erc20Address as `0x${string}`,
            abi: erc20Abi,
            functionName: 'totalSupply',
        })

        if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json')
            res.status(200).send(jsonToString({data}));
        } else {
            handleBadRequest("Use POST only", res)
        }

    } catch (err) {
        handleError(err, res)
    }

}