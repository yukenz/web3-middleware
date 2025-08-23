import type {NextApiRequest, NextApiResponse} from "next";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {getPublicClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {hexString} from "@/lib/zod";
import {Hex} from "viem";

const EthBalanceOfRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    address: hexString(),
});

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {chain, address} = EthBalanceOfRequest.parse(req.body);

    const publicClient = getPublicClient({chain});
    const data = await publicClient.getBalance({
        address: address as Hex
    });

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({data}));

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {
    const {query, method} = req;
    try {
        switch (method) {
            case "POST":
                await postProcessor(req, res);
                break;
            default:
                handleMethodNotAllowed(method, ["POST"], res)
        }
    } catch (err) {
        handleError(err, res)
    }
}