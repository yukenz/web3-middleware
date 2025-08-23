import type {NextApiRequest, NextApiResponse} from "next";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {jsonToString} from "@/lib/utils";
import * as z from "zod";
import {hexString} from "@/lib/zod";
import {Hex, recoverMessageAddress} from "viem";

const EthEcRecoverRequest = z.object({
    signature: hexString(),
    message: z.string(),
});

async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    const {signature, message} = EthEcRecoverRequest.parse(req.body);

    const data = await recoverMessageAddress({
        message: message,
        signature: signature as Hex,
    })

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(jsonToString({data}));

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