import type {NextApiRequest, NextApiResponse} from "next";
import {handleError, handleMethodNotAllowed} from "@/lib/error";


async function postProcessor(
    req: NextApiRequest,
    res: NextApiResponse<{}>,
) {

    res.setHeader('Content-Type', 'application/json')
    res.status(200).json({
        "token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
        "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
    });
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