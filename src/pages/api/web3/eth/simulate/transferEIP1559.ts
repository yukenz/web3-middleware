import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {Hex} from "viem";
import {hexString, stringBigInt} from "@/lib/zod";


const EthTransferRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    privateKey: hexString(),
    toAddress: hexString(),
    amount: stringBigInt(),
});


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const request = EthTransferRequest.parse(req.body);

    const masterWallet = getWalletClient({
        chain: request.chain,
        privateKey: process.env.MASTER_PRIVATE_KEY as Hex
    });

    const estimateGas = await masterWallet.estimateGas({
        account: masterWallet.account,
        to: request.toAddress as Hex,
        value: BigInt(request.amount)
    })

    const gasPrice = await masterWallet.getGasPrice()
    const feesPerGas = await masterWallet.estimateFeesPerGas({
        type: 'eip1559',
    })

    const maxPriorityFeePerGas = await masterWallet.estimateMaxPriorityFeePerGas()
    const baseFee = await masterWallet.getBlobBaseFee()
    const feeHistory = await masterWallet.getFeeHistory({
        blockCount: 4,
        rewardPercentiles: [25, 75]
    })

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({
        estimateGas,
        gasPrice,
        feesPerGas,
        maxPriorityFeePerGas,
        baseFee,
        feeHistory,
        gasFee: estimateGas * gasPrice
    }));

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