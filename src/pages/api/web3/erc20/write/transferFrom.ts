import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {erc20Abi} from "@/abi/erc20";
import {formatEther, Hex} from "viem";
import {hexString, stringBigInt} from "@/lib/zod";
import {jsonToString} from "@/lib/utils";


const ERC20TransferFromRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    privateKey: hexString(),
    sourceAddress: hexString(),
    destinationAddress: hexString(),
    erc20Address: hexString(),
    amount: stringBigInt(),
});


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {
        erc20Address,
        sourceAddress,
        destinationAddress,
        privateKey,
        chain,
        amount
    } = ERC20TransferFromRequest.parse(req.body);

    const walletClient = getWalletClient({chain, privateKey: privateKey as Hex});

    const {result: simulationResult, request} = await walletClient.simulateContract({
        address: erc20Address as Hex,
        abi: erc20Abi,
        functionName: 'transferFrom',
        args: [sourceAddress as Hex, destinationAddress as Hex, BigInt(amount)]
    })

    const gas = await walletClient.estimateContractGas(request);
    const fees = await walletClient.estimateFeesPerGas({type: 'eip1559',})
    const estWei = gas * (fees.maxFeePerGas ?? fees.gasPrice!)
    const consumedEther = formatEther(estWei, 'wei');

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({simulationResult, gas, consumedEther}));
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