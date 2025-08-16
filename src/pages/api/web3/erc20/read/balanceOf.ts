import type {NextApiRequest, NextApiResponse} from "next";
import {getPublicClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {erc20Abi} from "@/abi/erc20";
import {jsonToString} from "@/lib/utils";
import {hexString} from "@/lib/zod";
import {Hex} from "viem";


const ERC20BalanceOfRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    erc20Address: hexString(),
    walletAddress: hexString(),
});


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {
        erc20Address,
        walletAddress,
        chain
    } = ERC20BalanceOfRequest.parse(req.body);

    const publicClient = getPublicClient({chain});

    const data = await publicClient.readContract({
        address: erc20Address as Hex,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [
            walletAddress as Hex
        ],
    })
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