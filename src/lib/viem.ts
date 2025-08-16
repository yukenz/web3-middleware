import {anvil, liskSepolia, mainnet, monadTestnet} from 'viem/chains'
import {createPublicClient, createWalletClient, Hex, http, publicActions} from "viem";
import {privateKeyToAccount} from "viem/accounts";

export type KeyRegisteredChain = keyof typeof registeredChain;

export const registeredChain = {
    anvil,
    mainnet,
    monadTestnet,
    liskSepolia
};

export const registeredChainRpc: { [K in KeyRegisteredChain]: string } = {
    anvil: anvil.rpcUrls.default.http[0],
    mainnet: process.env.CHAIN_RPC_MAINNET as string,
    monadTestnet: process.env.CHAIN_RPC_MONADTESTNET as string,
    liskSepolia: liskSepolia.rpcUrls.default.http[0]
};

export const registeredWalleEip712Address: { [K in KeyRegisteredChain]: `0x${string}` } = {
    anvil: process.env.WALLE_EIP712_ADDRESS_ANVIL as `0x${string}`,
    mainnet: process.env.WALLE_EIP712_ADDRESS_MAINNET as `0x${string}`,
    monadTestnet: process.env.WALLE_EIP712_ADDRESS_MONADTESTNET as `0x${string}`,
    liskSepolia: process.env.WALLE_EIP712_ADDRESS_LISKSEPOLIA as `0x${string}`
};

export function getPublicClient(props: {
    chain: KeyRegisteredChain
}) {

    const chainObj = registeredChain[props.chain];
    const rpcUrl = registeredChainRpc[props.chain];

    console.log("Invoke getPublicClient()", {
        chain: props.chain,
        rpcUrl
    })

    return createPublicClient({
        chain: chainObj,
        transport: http(rpcUrl)
    })
}

export function getWalletClient(props: {
    privateKey: Hex,
    chain: KeyRegisteredChain
}) {

    const chainObj = registeredChain[props.chain];
    const rpcUrl = registeredChainRpc[props.chain];

    console.log("Invoke getPublicClient()", {
        chain: props.chain,
        rpcUrl
    })

    const account = privateKeyToAccount(props.privateKey);

    return createWalletClient({
        account,
        chain: chainObj,
        transport: http(rpcUrl)
    }).extend(publicActions)
}