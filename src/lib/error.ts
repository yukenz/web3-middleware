import * as z from "zod";
import type {NextApiResponse} from "next";

export function handleError(err: any, res: NextApiResponse<any>) {

    console.log("Got handleError()", err)

    if (err instanceof z.ZodError) {
        res.setHeader('Content-Type', 'application/json')
        res.status(505).json({
            error: err.name,
            errorDetail: err.issues
        })
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(500).json({
        error: "01",
        errorDetail: err
    })
}

export function handleBadRequest(errorDetail: string, res: NextApiResponse<any>) {
    res.setHeader('Content-Type', 'application/json')
    res.status(400).json({
        error: "01",
        errorDetail
    })
}

export function handleMethodNotAllowed(currentMethod:  string | undefined, value: string[], res: NextApiResponse<any>) {
    res.setHeader("Allow", value);
    res.status(405).end(`Method ${currentMethod} Not Allowed`);
}