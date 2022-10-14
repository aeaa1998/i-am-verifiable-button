import { Metaplex, Pda } from "@metaplex-foundation/js"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js"
import { useWallet } from "solana-wallets-vue"
import { inject, provide } from "vue"
import { computed } from "vue"
import { ref, watch } from "vue"
import axios from 'axios';


const serializeNft = (nft) => JSON.stringify(nft)

export const normalizeNft = (nftDeserialized) => {
    nftDeserialized.address = new Pda(nftDeserialized.address, 255)
    if(nftDeserialized.mintAddress){
        nftDeserialized.mintAddress = new PublicKey(nftDeserialized.mintAddress)
    }
    if(nftDeserialized.mint){
        nftDeserialized.mint.address = new PublicKey(nftDeserialized.mint.address)
    }
    nftDeserialized.updateAuthorityAddress = new PublicKey(nftDeserialized.updateAuthorityAddress)
    if(nftDeserialized.collection){
        nftDeserialized.collection.address = new PublicKey(nftDeserialized.collection.address)
    }
    nftDeserialized.creators = nftDeserialized.creators.map(c => {
        c.address = new PublicKey(c.address)
        return c
    })
    
    return nftDeserialized
}
const _deserializeNft = (nft) => {
    let nftDeserialized = JSON.parse(nft)
    return normalizeNft(nftDeserialized)
    
}

const connection = new Connection(clusterApiUrl('devnet'))
const metaplex = Metaplex.make(connection)
const getKey = (req) => `iam-req-${req}`


const findRequisitesByMintList = async (requisites) => {
    //There are requisites
    //remove the duplicates
    let missingRequisites = []
    let requisitesInStorage = [... new Set(requisites)].reduce((carry, req) => {
        const reqStorage = localStorage.getItem(getKey(req))
        //It it is found return it
        // if(reqStorage){
        //     carry.push(_deserializeNft(reqStorage))
        // }else{
            missingRequisites.push(reqStorage)
        // }
        return carry
    },[])

    if(missingRequisites && missingRequisites.length){
        //Fetch the missing
        const _nfts = await metaplex.nfts().findAllByMintList({ mints: requisites.map(req => new PublicKey(req)) }).run()
        _nfts.forEach(nft => {
            localStorage.setItem(getKey(nft.mintAddress ? nft.mintAddress.toBase58() : nft.mint.address.toBase58()), serializeNft(nft))
        })
        
        requisitesInStorage.push(..._nfts)
    }
    return requisitesInStorage
}

export function useRequisites (nft) {
    const requisitesList = computed(() => nft.value && nft.value.json ? nft.value.json.requisites : [])
    const requisites = ref([])
    const isFetchingRequisited = ref(false)
    
    watch((requisitesList), (newValue) => {
        //If there are any requisites
        if(newValue.length && !requisites.value.length){
            (async () => {
                isFetchingRequisited.value = true
                //Set the requisites
                requisites.value = await findRequisitesByMintList(newValue);
                isFetchingRequisited.value = false
            })()
        }
    }, {immediate: true})

    
    return {
        requisites,
        isFetchingRequisited
    }
}



export function useNftsOfUser(){
    return {
        nftsOfUser: inject("nftsOfUser"),
        isFetchingNftsOfUser: inject("isFetchingNftsOfUser")
    }
}


export async function fetchUserNfts(_isFetchingNftsOfUser) {
    const { wallet } = useWallet()
    try {
        const { iAmVerifiableAxios } = useIamVerifiable()
        const response = await iAmVerifiableAxios.get("/user/nfts?wallet=" + wallet.value.publicKey);
        return response.data.nfts.map(normalizeNft)
    } catch(e) {
        return []
    }
}

let iamVerifiable = null

export const useIamVerifiable = () => iamVerifiable

export function initIamVerifiable() {
    
    const { connected, wallet: _wallet } = useWallet()
    const wallet = useWallet()
    const nftsOfUser = ref([])
    const isFetchingNftsOfUser = ref(false)
    provide('nftsOfUser', nftsOfUser)
    provide('isFetchingNftsOfUser', isFetchingNftsOfUser)


    //On first moment fetch
    watch(connected, async (newValueConnected) => {

        if(newValueConnected){    
            isFetchingNftsOfUser.value = true
            nftsOfUser.value = await fetchUserNfts(isFetchingNftsOfUser)
            console.log(nftsOfUser.value)
            isFetchingNftsOfUser.value = false
        }else{
            nftsOfUser.value = []
        }
    }, { immediate: true })

    const iAmVerifiableAxios = axios.create({
        //
        baseURL: 'http://ec2-18-218-183-200.us-east-2.compute.amazonaws.com/'
    })
    iamVerifiable = {
        nftsOfUser, isFetchingNftsOfUser, iAmVerifiableAxios
    }
    
}

export async function useIamVerification(requisites){
    requisites = requisites.value  ? requisites.value : requisites
    
    if(!requisites.length) return true
    //If there are verifiables
    else {
        const { nftsOfUser, isFetchingNftsOfUser } = useIamVerifiable()
        const { wallet } = useWallet()
        
        if(!nftsOfUser.value.length){
            isFetchingNftsOfUser.value = true
            nftsOfUser.value = await fetchUserNfts(isFetchingNftsOfUser)
            isFetchingNftsOfUser.value = false
        }


        let credentilsOfCollection = nftsOfUser.value.map(credential => credential.collection.address.toBase58())
        const isContained = requisites.every(req => credentilsOfCollection.includes(req))
        
        return isContained
        
        
    }
}


