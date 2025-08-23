import * as z from "zod";
import type {NextApiResponse} from "next";

/**
 * ====================================
 * API LEVEL
 * ====================================
 * */
export function handleError(err: any, res: NextApiResponse<any>) {
    console.log("Got handleError()", err);

    // 02
    if (err instanceof z.ZodError) {
        res.setHeader("Content-Type", "application/json");
        res.status(505).json({
            errorCode: "02",
            errorDetail: err.issues,
        });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(500).json({
        errorCode: "01",
        errorDetail: err?.message,
    });
}

export function handleBadRequest(
    errorDetail: string,
    res: NextApiResponse<any>
) {
    res.setHeader("Content-Type", "application/json");
    res.status(400).json({
        errorCode: "01",
        errorDetail,
    });
}

export function handleMethodNotAllowed(
    currentMethod: string | undefined,
    value: string[],
    res: NextApiResponse<any>
) {
    res.setHeader("Allow", value);
    res.status(405) //.end(`Method ${currentMethod} Not Allowed`);
    res.status(400).json({
        errorCode: "01",
        errorDetail: `Method ${currentMethod} Not Allowed`,
    });
}

/**
 * ====================================
 * MIDDLEWARE LEVEL
 * ====================================
 * */
export function middlewareHandleUnauthorized(errorDetail: string) {
    return Response.json(
        {
            error: "03",
            errorDetail,
        },
        {status: 401}
    );
}
