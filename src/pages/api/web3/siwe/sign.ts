import type {NextApiRequest, NextApiResponse} from "next";
import {KeyRegisteredChain, registeredChain} from "@/lib/viem";
import * as z from "zod";
import {handleBadRequest, handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import {privateKeyToAccount} from "viem/accounts";
import type {Hex} from "viem";


const HexAddress = z.string().refine(
    (val) => val.startsWith("0x"),
    {message: "Must start with 0x"}
);

const SIWESignRequest = z.object({
    chain: z.enum(Object.keys(registeredChain) as [KeyRegisteredChain]),
    yourPrivateKey: HexAddress,
    message: z.string()
});

const sampleReq: z.infer<typeof SIWESignRequest> = {
    "chain": "monadTestnet",
    "yourPrivateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "message": `aone.my.id wants you to sign in with your Ethereum account:\\n0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\\n\\n\\nURI: https://aone.my.id/auth\\nVersion: 1\\nChain ID: 4202\\nNonce: 7bea9ecbaed9d1bac7e93d9f0b038c518680b58139401a7cd577d13d9c13ad07bda619142585e67e08814d4392c6398a\\nIssued At: 2025-08-16T09:47:45.640Z`
}

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    if (req.method === 'POST') {

        const request = SIWESignRequest.parse(req.body);
        const account = privateKeyToAccount(request.yourPrivateKey as Hex);

        const signature = await account.signMessage({
            message: request.message
        });

        res.setHeader('Content-Type', 'application/json')
        res.status(200).send(jsonToString({
            yourAddress: account.address,
            signature
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