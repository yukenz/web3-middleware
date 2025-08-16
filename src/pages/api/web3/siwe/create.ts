import type {NextApiRequest, NextApiResponse} from "next";
import {KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {createSiweMessage, generateSiweNonce} from 'viem/siwe'
import {hexString} from "@/lib/zod";



const SIWECreateRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    yourAddress: hexString(),
});

const sampleReq: z.infer<typeof SIWECreateRequest> = {
    "chain": "monadTestnet",
    "yourAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

}

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const request = SIWECreateRequest.parse(req.body);
    const nonce = generateSiweNonce()

    const message = createSiweMessage({
        address: request.yourAddress as `0x${string}`,
        chainId: registeredChain[request.chain].id,
        domain: 'aone.my.id',
        nonce,
        uri: 'https://aone.my.id/auth',
        version: '1',
    })


    if (req.method === 'POST') {
        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(jsonToString({message}));
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