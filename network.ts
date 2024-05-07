export interface Network {
    name: string
    rpc: string
    factory: `0x${string}`
}

export interface NetworkList {
    ETHEREUM: Network
    ARBITRUM: Network
    OPTIMISM: Network
    POLYGON: Network
    BSC: Network
}

export const networks: NetworkList = {
    ETHEREUM: { 
        name: "Ethereum", 
        rpc: "https://rpc.ankr.com/eth/",
        factory: "0xaF2Cf343735D6dd59f659F9CBbFb80e3d13f318d"
    },
    ARBITRUM: { 
        name: "Arbitrum", 
        rpc: "https://rpc.ankr.com/arbitrum/",
        factory: "0xaf4aBF251a10b02E0E1F8501b4D720B9228eD9Dc"
    },
    OPTIMISM: { 
        name: "Optimism", 
        rpc: "https://rpc.ankr.com/optimism/",
        factory: "0xb7c879ac00c0D73D7Ee2cFA37aa05a286a3147DA"
    },
    POLYGON: { 
        name: "Polygon",
        rpc: "https://rpc.ankr.com/polygon/",
        factory: "0x238A06c8B480F00AD9cd0556c8cb19fb96C81483"
    },
    BSC: {
        name: "Binance Smart Chain",
        rpc: "https://rpc.ankr.com/bsc/",
        factory: "0x451d89c2Ef29F5e4b373dA42738A89B9455ec4b4"
    }
}
