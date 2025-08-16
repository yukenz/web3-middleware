import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {erc20Abi} from "@/abi/erc20";
import {Hex} from "viem";
import {hexString, stringBigInt} from "@/lib/zod";
import {jsonToString} from "@/lib/utils";


const ERC20ApproveRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    privateKey: hexString(),
    erc20Address: hexString(),
    destinationAddress: hexString(),
    amount: stringBigInt(),
});


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {
        erc20Address,
        destinationAddress,
        privateKey,
        chain,
        amount
    } = ERC20ApproveRequest.parse(req.body);


    const walletClient = getWalletClient({chain, privateKey: privateKey as Hex});


    const trxHash = await walletClient.writeContract({
        address: erc20Address as Hex,
        abi: erc20Abi,
        functionName: 'approve',
        args: [destinationAddress as Hex, BigInt(amount)]
    })

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({trxHash}));

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