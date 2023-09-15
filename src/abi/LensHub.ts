import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './LensHub.abi'

export const abi = new ethers.Interface(ABI_JSON);

export const events = {
    Approval: new LogEvent<([owner: string, approved: string, tokenId: bigint] & {owner: string, approved: string, tokenId: bigint})>(
        abi, '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'
    ),
    ApprovalForAll: new LogEvent<([owner: string, operator: string, approved: boolean] & {owner: string, operator: string, approved: boolean})>(
        abi, '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31'
    ),
    Transfer: new LogEvent<([from: string, to: string, tokenId: bigint] & {from: string, to: string, tokenId: bigint})>(
        abi, '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    ),
}

export const functions = {
    DANGER__disableTokenGuardian: new Func<[], {}, []>(
        abi, '0x2248f76d'
    ),
    approve: new Func<[to: string, tokenId: bigint], {to: string, tokenId: bigint}, []>(
        abi, '0x095ea7b3'
    ),
    balanceOf: new Func<[owner: string], {owner: string}, bigint>(
        abi, '0x70a08231'
    ),
    burn: new Func<[tokenId: bigint], {tokenId: bigint}, []>(
        abi, '0x42966c68'
    ),
    burnWithSig: new Func<[_: bigint, _: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})], {}, []>(
        abi, '0xdd69cdb1'
    ),
    collect: new Func<[profileId: bigint, pubId: bigint, data: string], {profileId: bigint, pubId: bigint, data: string}, bigint>(
        abi, '0x84114ad4'
    ),
    collectWithSig: new Func<[vars: ([collector: string, profileId: bigint, pubId: bigint, data: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {collector: string, profileId: bigint, pubId: bigint, data: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([collector: string, profileId: bigint, pubId: bigint, data: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {collector: string, profileId: bigint, pubId: bigint, data: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0xb48951e4'
    ),
    comment: new Func<[vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string})], {vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string})}, bigint>(
        abi, '0xb6f32d2b'
    ),
    commentWithSig: new Func<[vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0x7a375716'
    ),
    commentWithSig_Dispatcher: new Func<[vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0x127bf388'
    ),
    createProfile: new Func<[vars: ([to: string, handle: string, imageURI: string, followModule: string, followModuleInitData: string, followNFTURI: string] & {to: string, handle: string, imageURI: string, followModule: string, followModuleInitData: string, followNFTURI: string})], {vars: ([to: string, handle: string, imageURI: string, followModule: string, followModuleInitData: string, followNFTURI: string] & {to: string, handle: string, imageURI: string, followModule: string, followModuleInitData: string, followNFTURI: string})}, bigint>(
        abi, '0xffea138e'
    ),
    defaultProfile: new Func<[wallet: string], {wallet: string}, bigint>(
        abi, '0x92254a62'
    ),
    emitCollectNFTTransferEvent: new Func<[profileId: bigint, pubId: bigint, collectNFTId: bigint, from: string, to: string], {profileId: bigint, pubId: bigint, collectNFTId: bigint, from: string, to: string}, []>(
        abi, '0x86e2947b'
    ),
    emitFollowNFTTransferEvent: new Func<[profileId: bigint, followNFTId: bigint, from: string, to: string], {profileId: bigint, followNFTId: bigint, from: string, to: string}, []>(
        abi, '0xbdfdd4bc'
    ),
    enableTokenGuardian: new Func<[], {}, []>(
        abi, '0x1e9df673'
    ),
    exists: new Func<[tokenId: bigint], {tokenId: bigint}, boolean>(
        abi, '0x4f558e79'
    ),
    follow: new Func<[profileIds: Array<bigint>, datas: Array<string>], {profileIds: Array<bigint>, datas: Array<string>}, Array<bigint>>(
        abi, '0xfb78ae6c'
    ),
    followWithSig: new Func<[vars: ([follower: string, profileIds: Array<bigint>, datas: Array<string>, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {follower: string, profileIds: Array<bigint>, datas: Array<string>, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([follower: string, profileIds: Array<bigint>, datas: Array<string>, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {follower: string, profileIds: Array<bigint>, datas: Array<string>, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, Array<bigint>>(
        abi, '0x8e4fd6a9'
    ),
    getApproved: new Func<[tokenId: bigint], {tokenId: bigint}, string>(
        abi, '0x081812fc'
    ),
    getCollectModule: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, string>(
        abi, '0x57ff49f6'
    ),
    getCollectNFT: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, string>(
        abi, '0x52aaef55'
    ),
    getCollectNFTImpl: new Func<[], {}, string>(
        abi, '0x77349a5f'
    ),
    getContentURI: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, string>(
        abi, '0xb5a31496'
    ),
    getDispatcher: new Func<[profileId: bigint], {profileId: bigint}, string>(
        abi, '0x540528b9'
    ),
    getDomainSeparator: new Func<[], {}, string>(
        abi, '0xed24911d'
    ),
    getFollowModule: new Func<[profileId: bigint], {profileId: bigint}, string>(
        abi, '0xd923d20c'
    ),
    getFollowNFT: new Func<[profileId: bigint], {profileId: bigint}, string>(
        abi, '0xa9ec6563'
    ),
    getFollowNFTImpl: new Func<[], {}, string>(
        abi, '0x3502ac4b'
    ),
    getFollowNFTURI: new Func<[profileId: bigint], {profileId: bigint}, string>(
        abi, '0x374c9473'
    ),
    getGovernance: new Func<[], {}, string>(
        abi, '0x289b3c0d'
    ),
    getHandle: new Func<[profileId: bigint], {profileId: bigint}, string>(
        abi, '0xec81d194'
    ),
    getProfile: new Func<[profileId: bigint], {profileId: bigint}, ([pubCount: bigint, followModule: string, followNFT: string, handle: string, imageURI: string, followNFTURI: string] & {pubCount: bigint, followModule: string, followNFT: string, handle: string, imageURI: string, followNFTURI: string})>(
        abi, '0xf08f4f64'
    ),
    getProfileIdByHandle: new Func<[handle: string], {handle: string}, bigint>(
        abi, '0x20fa728a'
    ),
    getPub: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, ([profileIdPointed: bigint, pubIdPointed: bigint, contentURI: string, referenceModule: string, collectModule: string, collectNFT: string] & {profileIdPointed: bigint, pubIdPointed: bigint, contentURI: string, referenceModule: string, collectModule: string, collectNFT: string})>(
        abi, '0xc736c990'
    ),
    getPubCount: new Func<[profileId: bigint], {profileId: bigint}, bigint>(
        abi, '0x3a15ff07'
    ),
    getPubPointer: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, [_: bigint, _: bigint]>(
        abi, '0x5ca3eebf'
    ),
    getPubType: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, number>(
        abi, '0x31fff07c'
    ),
    getReferenceModule: new Func<[profileId: bigint, pubId: bigint], {profileId: bigint, pubId: bigint}, string>(
        abi, '0xb7984c05'
    ),
    getState: new Func<[], {}, number>(
        abi, '0x1865c57d'
    ),
    getTokenGuardianDisablingTimestamp: new Func<[wallet: string], {wallet: string}, bigint>(
        abi, '0xf3bc61f1'
    ),
    isApprovedForAll: new Func<[owner: string, operator: string], {owner: string, operator: string}, boolean>(
        abi, '0xe985e9c5'
    ),
    isCollectModuleWhitelisted: new Func<[collectModule: string], {collectModule: string}, boolean>(
        abi, '0xad3e72bf'
    ),
    isFollowModuleWhitelisted: new Func<[followModule: string], {followModule: string}, boolean>(
        abi, '0x1cbb2620'
    ),
    isProfileCreatorWhitelisted: new Func<[profileCreator: string], {profileCreator: string}, boolean>(
        abi, '0xaf05dd22'
    ),
    isReferenceModuleWhitelisted: new Func<[referenceModule: string], {referenceModule: string}, boolean>(
        abi, '0x8e204fb4'
    ),
    mintTimestampOf: new Func<[tokenId: bigint], {tokenId: bigint}, bigint>(
        abi, '0x50ddf35c'
    ),
    mirror: new Func<[vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string})], {vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string})}, bigint>(
        abi, '0x2faeed81'
    ),
    mirrorWithSig: new Func<[vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0xdf457c34'
    ),
    mirrorWithSig_Dispatcher: new Func<[vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, profileIdPointed: bigint, pubIdPointed: bigint, referenceModuleData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0xd0d4e083'
    ),
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
    ownerOf: new Func<[tokenId: bigint], {tokenId: bigint}, string>(
        abi, '0x6352211e'
    ),
    permit: new Func<[_: string, _: bigint, _: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})], {}, []>(
        abi, '0x7ef67f99'
    ),
    permitForAll: new Func<[_: string, _: string, _: boolean, _: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})], {}, []>(
        abi, '0x89028a13'
    ),
    post: new Func<[vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string})], {vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string})}, bigint>(
        abi, '0x963ff141'
    ),
    postWithSig: new Func<[vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0x3b508132'
    ),
    postWithSig_Dispatcher: new Func<[vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, contentURI: string, collectModule: string, collectModuleInitData: string, referenceModule: string, referenceModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, bigint>(
        abi, '0xf8db2a91'
    ),
    'safeTransferFrom(address,address,uint256)': new Func<[from: string, to: string, tokenId: bigint], {from: string, to: string, tokenId: bigint}, []>(
        abi, '0x42842e0e'
    ),
    'safeTransferFrom(address,address,uint256,bytes)': new Func<[from: string, to: string, tokenId: bigint, _data: string], {from: string, to: string, tokenId: bigint, _data: string}, []>(
        abi, '0xb88d4fde'
    ),
    setApprovalForAll: new Func<[operator: string, approved: boolean], {operator: string, approved: boolean}, []>(
        abi, '0xa22cb465'
    ),
    setDefaultProfile: new Func<[profileId: bigint], {profileId: bigint}, []>(
        abi, '0xf1b2f8bc'
    ),
    setDefaultProfileWithSig: new Func<[vars: ([wallet: string, profileId: bigint, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {wallet: string, profileId: bigint, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([wallet: string, profileId: bigint, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {wallet: string, profileId: bigint, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, []>(
        abi, '0xdc217253'
    ),
    setDispatcher: new Func<[profileId: bigint, dispatcher: string], {profileId: bigint, dispatcher: string}, []>(
        abi, '0xbfd24f47'
    ),
    setDispatcherWithSig: new Func<[vars: ([profileId: bigint, dispatcher: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, dispatcher: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, dispatcher: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, dispatcher: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, []>(
        abi, '0xbfbf0b4b'
    ),
    setEmergencyAdmin: new Func<[newEmergencyAdmin: string], {newEmergencyAdmin: string}, []>(
        abi, '0x35da3394'
    ),
    setFollowModule: new Func<[profileId: bigint, followModule: string, followModuleInitData: string], {profileId: bigint, followModule: string, followModuleInitData: string}, []>(
        abi, '0x6dea40b3'
    ),
    setFollowModuleWithSig: new Func<[vars: ([profileId: bigint, followModule: string, followModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, followModule: string, followModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, followModule: string, followModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, followModule: string, followModuleInitData: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, []>(
        abi, '0x3b28b89f'
    ),
    setFollowNFTURI: new Func<[profileId: bigint, followNFTURI: string], {profileId: bigint, followNFTURI: string}, []>(
        abi, '0xc6b5d06c'
    ),
    setFollowNFTURIWithSig: new Func<[vars: ([profileId: bigint, followNFTURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, followNFTURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, followNFTURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, followNFTURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, []>(
        abi, '0xbd12d3f0'
    ),
    setGovernance: new Func<[newGovernance: string], {newGovernance: string}, []>(
        abi, '0xab033ea9'
    ),
    setProfileImageURI: new Func<[profileId: bigint, imageURI: string], {profileId: bigint, imageURI: string}, []>(
        abi, '0x054871b8'
    ),
    setProfileImageURIWithSig: new Func<[vars: ([profileId: bigint, imageURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, imageURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})], {vars: ([profileId: bigint, imageURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})] & {profileId: bigint, imageURI: string, sig: ([v: number, r: string, s: string, deadline: bigint] & {v: number, r: string, s: string, deadline: bigint})})}, []>(
        abi, '0x9b84a14c'
    ),
    setState: new Func<[newState: number], {newState: number}, []>(
        abi, '0x56de96db'
    ),
    sigNonces: new Func<[_: string], {}, bigint>(
        abi, '0xf990ccd7'
    ),
    supportsInterface: new Func<[interfaceId: string], {interfaceId: string}, boolean>(
        abi, '0x01ffc9a7'
    ),
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
    tokenByIndex: new Func<[index: bigint], {index: bigint}, bigint>(
        abi, '0x4f6ccce7'
    ),
    tokenDataOf: new Func<[tokenId: bigint], {tokenId: bigint}, ([owner: string, mintTimestamp: bigint] & {owner: string, mintTimestamp: bigint})>(
        abi, '0xc0da9bcd'
    ),
    tokenOfOwnerByIndex: new Func<[owner: string, index: bigint], {owner: string, index: bigint}, bigint>(
        abi, '0x2f745c59'
    ),
    tokenURI: new Func<[tokenId: bigint], {tokenId: bigint}, string>(
        abi, '0xc87b56dd'
    ),
    totalSupply: new Func<[], {}, bigint>(
        abi, '0x18160ddd'
    ),
    transferFrom: new Func<[from: string, to: string, tokenId: bigint], {from: string, to: string, tokenId: bigint}, []>(
        abi, '0x23b872dd'
    ),
    whitelistCollectModule: new Func<[collectModule: string, whitelist: boolean], {collectModule: string, whitelist: boolean}, []>(
        abi, '0x31dcebe3'
    ),
    whitelistFollowModule: new Func<[followModule: string, whitelist: boolean], {followModule: string, whitelist: boolean}, []>(
        abi, '0xa6d8e1e4'
    ),
    whitelistProfileCreator: new Func<[profileCreator: string, whitelist: boolean], {profileCreator: string, whitelist: boolean}, []>(
        abi, '0x20905506'
    ),
    whitelistReferenceModule: new Func<[referenceModule: string, whitelist: boolean], {referenceModule: string, whitelist: boolean}, []>(
        abi, '0x4187e4c5'
    ),
}

export class Contract extends ContractBase {

    balanceOf(owner: string): Promise<bigint> {
        return this.eth_call(functions.balanceOf, [owner])
    }

    defaultProfile(wallet: string): Promise<bigint> {
        return this.eth_call(functions.defaultProfile, [wallet])
    }

    exists(tokenId: bigint): Promise<boolean> {
        return this.eth_call(functions.exists, [tokenId])
    }

    getApproved(tokenId: bigint): Promise<string> {
        return this.eth_call(functions.getApproved, [tokenId])
    }

    getCollectModule(profileId: bigint, pubId: bigint): Promise<string> {
        return this.eth_call(functions.getCollectModule, [profileId, pubId])
    }

    getCollectNFT(profileId: bigint, pubId: bigint): Promise<string> {
        return this.eth_call(functions.getCollectNFT, [profileId, pubId])
    }

    getCollectNFTImpl(): Promise<string> {
        return this.eth_call(functions.getCollectNFTImpl, [])
    }

    getContentURI(profileId: bigint, pubId: bigint): Promise<string> {
        return this.eth_call(functions.getContentURI, [profileId, pubId])
    }

    getDispatcher(profileId: bigint): Promise<string> {
        return this.eth_call(functions.getDispatcher, [profileId])
    }

    getDomainSeparator(): Promise<string> {
        return this.eth_call(functions.getDomainSeparator, [])
    }

    getFollowModule(profileId: bigint): Promise<string> {
        return this.eth_call(functions.getFollowModule, [profileId])
    }

    getFollowNFT(profileId: bigint): Promise<string> {
        return this.eth_call(functions.getFollowNFT, [profileId])
    }

    getFollowNFTImpl(): Promise<string> {
        return this.eth_call(functions.getFollowNFTImpl, [])
    }

    getFollowNFTURI(profileId: bigint): Promise<string> {
        return this.eth_call(functions.getFollowNFTURI, [profileId])
    }

    getGovernance(): Promise<string> {
        return this.eth_call(functions.getGovernance, [])
    }

    getHandle(profileId: bigint): Promise<string> {
        return this.eth_call(functions.getHandle, [profileId])
    }

    getProfile(profileId: bigint): Promise<([pubCount: bigint, followModule: string, followNFT: string, handle: string, imageURI: string, followNFTURI: string] & {pubCount: bigint, followModule: string, followNFT: string, handle: string, imageURI: string, followNFTURI: string})> {
        return this.eth_call(functions.getProfile, [profileId])
    }

    getProfileIdByHandle(handle: string): Promise<bigint> {
        return this.eth_call(functions.getProfileIdByHandle, [handle])
    }

    getPub(profileId: bigint, pubId: bigint): Promise<([profileIdPointed: bigint, pubIdPointed: bigint, contentURI: string, referenceModule: string, collectModule: string, collectNFT: string] & {profileIdPointed: bigint, pubIdPointed: bigint, contentURI: string, referenceModule: string, collectModule: string, collectNFT: string})> {
        return this.eth_call(functions.getPub, [profileId, pubId])
    }

    getPubCount(profileId: bigint): Promise<bigint> {
        return this.eth_call(functions.getPubCount, [profileId])
    }

    getPubPointer(profileId: bigint, pubId: bigint): Promise<[_: bigint, _: bigint]> {
        return this.eth_call(functions.getPubPointer, [profileId, pubId])
    }

    getPubType(profileId: bigint, pubId: bigint): Promise<number> {
        return this.eth_call(functions.getPubType, [profileId, pubId])
    }

    getReferenceModule(profileId: bigint, pubId: bigint): Promise<string> {
        return this.eth_call(functions.getReferenceModule, [profileId, pubId])
    }

    getState(): Promise<number> {
        return this.eth_call(functions.getState, [])
    }

    getTokenGuardianDisablingTimestamp(wallet: string): Promise<bigint> {
        return this.eth_call(functions.getTokenGuardianDisablingTimestamp, [wallet])
    }

    isApprovedForAll(owner: string, operator: string): Promise<boolean> {
        return this.eth_call(functions.isApprovedForAll, [owner, operator])
    }

    isCollectModuleWhitelisted(collectModule: string): Promise<boolean> {
        return this.eth_call(functions.isCollectModuleWhitelisted, [collectModule])
    }

    isFollowModuleWhitelisted(followModule: string): Promise<boolean> {
        return this.eth_call(functions.isFollowModuleWhitelisted, [followModule])
    }

    isProfileCreatorWhitelisted(profileCreator: string): Promise<boolean> {
        return this.eth_call(functions.isProfileCreatorWhitelisted, [profileCreator])
    }

    isReferenceModuleWhitelisted(referenceModule: string): Promise<boolean> {
        return this.eth_call(functions.isReferenceModuleWhitelisted, [referenceModule])
    }

    mintTimestampOf(tokenId: bigint): Promise<bigint> {
        return this.eth_call(functions.mintTimestampOf, [tokenId])
    }

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }

    ownerOf(tokenId: bigint): Promise<string> {
        return this.eth_call(functions.ownerOf, [tokenId])
    }

    sigNonces(arg0: string): Promise<bigint> {
        return this.eth_call(functions.sigNonces, [arg0])
    }

    supportsInterface(interfaceId: string): Promise<boolean> {
        return this.eth_call(functions.supportsInterface, [interfaceId])
    }

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }

    tokenByIndex(index: bigint): Promise<bigint> {
        return this.eth_call(functions.tokenByIndex, [index])
    }

    tokenDataOf(tokenId: bigint): Promise<([owner: string, mintTimestamp: bigint] & {owner: string, mintTimestamp: bigint})> {
        return this.eth_call(functions.tokenDataOf, [tokenId])
    }

    tokenOfOwnerByIndex(owner: string, index: bigint): Promise<bigint> {
        return this.eth_call(functions.tokenOfOwnerByIndex, [owner, index])
    }

    tokenURI(tokenId: bigint): Promise<string> {
        return this.eth_call(functions.tokenURI, [tokenId])
    }

    totalSupply(): Promise<bigint> {
        return this.eth_call(functions.totalSupply, [])
    }
}
