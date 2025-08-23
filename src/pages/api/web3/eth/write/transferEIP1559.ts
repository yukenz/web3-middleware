import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {Hex} from "viem";
import {hexString, stringBigInt} from "@/lib/zod";


const EthTransferEIP1559Request = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    privateKey: hexString(),
    toAddress: hexString(),
    amount: stringBigInt(),
});


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const request = EthTransferEIP1559Request.parse(req.body);

    const masterWallet = getWalletClient({
        chain: request.chain,
        privateKey: process.env.MASTER_PRIVATE_KEY as Hex
    });

    const trxReceipt = await masterWallet.sendTransaction({
        type: 'eip1559',
        account: masterWallet.account,
        to: request.toAddress as Hex,
        value: BigInt(request.amount)
    });

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({trxReceipt}));

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