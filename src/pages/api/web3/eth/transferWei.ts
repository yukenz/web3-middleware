import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {Hex} from "viem";
import {stringBigInt, hexString} from "@/lib/zod";


const EthTransferRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    destinationAddress: hexString(),
    amount: stringBigInt(),
});

const sampleReq = {
    "chain": "monadTestnet",
    "destinationAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": "1000"
}

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const request = EthTransferRequest.parse(req.body);

    const masterWallet = getWalletClient({
        chain: request.chain,
        privateKey: process.env.MASTER_PRIVATE_KEY as Hex
    });

    const trxReceipt = await masterWallet.sendTransaction({
        account: masterWallet.account,
        to: request.destinationAddress as Hex,
        value: BigInt(request.amount)
    });


    if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(jsonToString({trxReceipt}));
    } else {
        handleBadRequest("Use POST only", res)
    }

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