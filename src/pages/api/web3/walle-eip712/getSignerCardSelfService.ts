import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {buildDomain, types} from "@/abi/eip712-walle";
import {hexString} from "@/lib/zod";
import {Hex, keccak256, toHex} from "viem";


const GetSignerCardSelfServiceRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    operation: z.number(),
    card: z.string(),
    pin: z.string(),
    privateKey: hexString()
});

const sampleReq: z.infer<typeof GetSignerCardSelfServiceRequest> = {
    "chain": "mainnet",
    "operation": 0,
    "card": "1234",
    "pin": "1234",
    "privateKey": "{{PK1}}",
}

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {
        chain,
        operation,
        card,
        pin,
        privateKey
    } = GetSignerCardSelfServiceRequest.parse(req.body);

    const domain = buildDomain(chain)

    const walletClient = getWalletClient({chain, privateKey: privateKey as Hex})

    const hashCard = keccak256(toHex(card));
    const hashPin = keccak256(toHex(pin));
    const signature = await walletClient.signTypedData({
        domain,
        types,
        primaryType: 'CardSelfService',
        message: {
            operation: operation,
            hashCard,
            hashPin,
        },
    })

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({signature, hashCard, hashPin}));
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