import type {NextApiRequest, NextApiResponse} from "next";
import {handleError, handleMethodNotAllowed} from "@/lib/error";
import {registeredChain} from "@/lib/viem";


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    res.setHeader('Content-Type', 'application/json')
    res.status(200).json(Object.keys(registeredChain));

}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {
    const {query, method} = req;
    try {
        switch (method) {
            case "GET":
                await postProcessor(req, res);
                break;
            default:
                handleMethodNotAllowed(method, ["GET"], res)
        }
    } catch (err) {
        handleError(err, res)
    }
}