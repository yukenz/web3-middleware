import type {NextApiRequest, NextApiResponse} from "next";
import {KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {createSiweMessage, generateSiweNonce} from 'viem/siwe'


const HexAddress = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const SIWECreateRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    yourAddress: HexAddress,
});

const sampleReq: z.infer<typeof SIWECreateRequest> = {
    "chain": "monadTestnet",
    "yourAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    try {

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
            res.status(200).send(jsonToString({message, nonce}));
        } else {
            handleBadRequest("Use POST only", res)
        }

    } catch (err) {
        handleError(err, res)
    }


}