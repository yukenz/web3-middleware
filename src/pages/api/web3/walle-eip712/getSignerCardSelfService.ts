import type {NextApiRequest, NextApiResponse} from "next";
import {getPublicClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {eip712abi} from "@/abi/eip712";
import {buildDomain} from "@/abi/eip712-walle";

const HexString = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const GetSignerCardSelfServiceRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    operation: z.number(),
    hashCard: HexString,
    hashPin: HexString,
    signature: HexString,
});

const sampleReq: z.infer<typeof GetSignerCardSelfServiceRequest> = {
    "chain": "mainnet",
    "operation": 0,
    "hashCard": "0xa86fd2fba383be6bb4b450c9001ea7444f651c42333174e2935b62443c182c38",
    "hashPin": "0x387a8233c96e1fc0ad5e284353276177af2186e7afa85296f106336e376669f7",
    "signature": "0x4c5ccd8b1eadf1b6e6d56590fa309ea49bf6f7de4c5e3069f55a5144d41130877f28c418f6dbf31b3c7284a59d110ff5b7e2a6b0f72e0ee604f2fdf5d7b0346c1c",
}

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const request = GetSignerCardSelfServiceRequest.parse(req.body);
    const publicClient = getPublicClient({chain: request.chain});
    const domain = buildDomain(request.chain)

    const recoveredAddress = await publicClient.readContract({
        address: domain.verifyingContract,
        abi: eip712abi,
        functionName: 'getSignerCardSelfService',
        args: [
            request.operation,
            request.hashCard as `0x${string}`,
            request.hashPin as `0x${string}`,
            request.signature as `0x${string}`
        ],
    })

    if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(jsonToString({recoveredAddress}));
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