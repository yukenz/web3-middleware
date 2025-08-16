import type {NextApiRequest, NextApiResponse} from "next";
import {getWalletClient, KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {Hex} from "viem";
import {parseSiweMessage, validateSiweMessage} from 'viem/siwe'


const HexAddress = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const SIWEVerificationRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    message: z.string(),
    signature: z.string(),
});

const sampleReq: z.infer<typeof SIWEVerificationRequest> = {
    "chain": "monadTestnet",
    "message": "sd",
    "signature": "sd"
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    try {

        const request = SIWEVerificationRequest.parse(req.body);
        const siweMessage = parseSiweMessage(request.message);
        const walletClient = getWalletClient({chain: request.chain, privateKey: process.env.MASTER_PRIVATE_KEY as Hex});

        const isValidSiweMessage = validateSiweMessage({
            address: walletClient.account.address, // Against
            message: {
                address: siweMessage.address,
                chainId: siweMessage.chainId,
                nonce: siweMessage.nonce,
                domain: siweMessage.domain,
                uri: siweMessage.uri,
                version: siweMessage.version,
            },
        })


        const isValidSiweSignature = await walletClient.verifySiweMessage({
            message: request.message,
            signature: request.signature as Hex,
        })

        if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json')
            res.status(200).send(jsonToString({
                isValidSiweMessage,
                isValidSiweSignature,
                siweMessage
            }));
        } else {
            handleBadRequest("Use POST only", res)
        }

    } catch (err) {
        handleError(err, res)
    }


}