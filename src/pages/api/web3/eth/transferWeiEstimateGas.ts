import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {Hex} from "viem";


const HexAddress = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const EthTransferRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    destinationAddress: HexAddress,
    amount: z.string().refine(
        (val) => {
            try {
                BigInt(val);
                return true
            } catch (err) {
                return false
            }
        },
        {message: "Invalid BigInt"}
    ),
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


    const estimateGas = await masterWallet.estimateGas({
        account: masterWallet.account,
        to: request.destinationAddress as Hex,
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

    if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(jsonToString({
            estimateGas,
            gasPrice,
            feesPerGas,
            maxPriorityFeePerGas,
            baseFee,
            feeHistory
        }));
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