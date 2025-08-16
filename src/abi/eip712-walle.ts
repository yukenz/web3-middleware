import {KeyRegisteredChain, registeredChain, registeredWalleEip712Address} from "@/lib/viem";

type EIP712Domain = {
    name: string,
    version: string,
    chainId: number,
    verifyingContract: `0x${string}`,
}

export function buildDomain(chain: KeyRegisteredChain): EIP712Domain {

    const returned = {
        name: 'Walle',
        version: '1',
        chainId: registeredChain[chain].id,
        verifyingContract: registeredWalleEip712Address[chain]
    };

    console.log("Invoke buildDomain()", returned)
    return returned
}

export const types = {
    CardSelfService: [
        {name: "operation", type: "uint8"},
        {name: "hashCard", type: "bytes32"},
        {name: "hashPin", type: "bytes32"},
    ],
    CardRequestPayment: [
        {name: "hashCard", type: "bytes32"},
        {name: "hashPin", type: "bytes32"},
        {name: "merchantId", type: "string"},
        {name: "merchantKey", type: "string"},
        {name: "terminalId", type: "string"},
        {name: "terminalKey", type: "string"},
        {name: "paymentAmount", type: "uint256"},
    ],
} as const