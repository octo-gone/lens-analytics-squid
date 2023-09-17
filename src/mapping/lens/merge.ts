import {DataHandlerContext} from '@subsquid/evm-processor'
import {Store} from '../../db'
import {NamedEntityBuffer} from '../../entityBuffer'
import {ProfileImageUpdateData, PublicationData, CollectData, ProfileTransferData} from '../types'
import {In} from 'typeorm'
import {Post, Comment, PublicationVariant, PublicationRef, Profile, Collect, ProfileTransfer, ProfileImageUpdate} from '../../model'
import {fetchContentBatch} from '../ipfs'
import {removeBrokenSurrogate} from '../utils'


export async function mergeData(ctx: DataHandlerContext<Store>) {
    // load fetched entities from buffer

    const createdProfiles = NamedEntityBuffer.flush<Profile>('ProfileCreated')
    const updatedProfileImages = NamedEntityBuffer.flush<ProfileImageUpdateData>('ProfileImageURISet')
    const createdPublications = NamedEntityBuffer.flush<PublicationData>('PublicationCreated')
    const createdCollects = NamedEntityBuffer.flush<CollectData>('PublicationCollected')
    const transferedProfiles = NamedEntityBuffer.flush<ProfileTransferData>('ProfileTransfered')

    // get ids used in entities

    const profileIds = [
        ...createdProfiles.map(x => x.id),
        ...updatedProfileImages.map(x => x.profileId),
        ...transferedProfiles.map(x => x.profileId)
    ]
    const pubIds: string[] = []

    // get addresses with timestamp

    const profileToAddressMap = new Map<string, [Date, Profile][]>()
    const profileAddresses: string[] = []

    for (let pubData of createdPublications) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                profileIds.push(pubData.creatorId)
                break
            }
            case PublicationVariant.MIRROR: {
                profileIds.push(pubData.creatorId)
                profileIds.push(pubData.mirroredProfileId)
                pubIds.push(pubData.mirroredPubId)
                break
            }
            case PublicationVariant.COMMENT: {
                profileIds.push(pubData.creatorId)
                profileIds.push(pubData.commentedProfileId)
                pubIds.push(pubData.commentedPubId)
                break
            }
        }
    }

    for (let collectData of createdCollects) {
        profileIds.push(collectData.profileId)
        profileIds.push(collectData.rootProfileId)
        pubIds.push(collectData.pubId)
        pubIds.push(collectData.rootPubId)
        profileAddresses.push(collectData.nftOwnerAddress)
    }

    // load entities using gathered ids

    const storeProfilesByID = await ctx.store.findBy(Profile, {id: In(profileIds)})
    const storeProfilesByAddress = await ctx.store.findBy(Profile, {address: In(profileAddresses)})
    const storePubsByID = await ctx.store.findBy(PublicationRef, {id: In(pubIds)})

    const profilesByID: Map<string, Profile> = new Map(
        storeProfilesByID.map((profile) => [profile.id, profile])
    )
    const profilesByAddress: Map<string, Profile> = new Map(
        storeProfilesByAddress.map((profile) => [profile.id, profile])
    )
    const pubsByID: Map<string, PublicationRef> = new Map(
        storePubsByID.map((pub) => [pub.id, pub])
    )

    const profiles = new Map([
        ...profilesByID,
        ...profilesByAddress
    ])
    const pubs = new Map([
        ...pubsByID,
    ])

    // update profiles

    for (let profileEntity of createdProfiles) {
        profiles.set(profileEntity.id, profileEntity)
    }

    function addToAddresToProfileToMap(profileEntity: Profile) {
        if (profileAddresses.includes(profileEntity.address)) {
            let addresses = profileToAddressMap.get(profileEntity.address)
            if (addresses === undefined) {
                addresses = [] as [Date, Profile][]
            }
            addresses.push([profileEntity.updatedAt, profileEntity])
            profileToAddressMap.set(profileEntity.address, addresses)
        }
    }

    for (let profileEntity of profiles.values()) {
        NamedEntityBuffer.add('Save', profileEntity)
        addToAddresToProfileToMap(profileEntity)
    }

    for (let profileImageUpdate of updatedProfileImages) {
        let profileEntity = profiles.get(profileImageUpdate.profileId)
        if (profileEntity == null) {
            ctx.log.warn(`profile for image update is missing, profile: ${JSON.stringify(profileImageUpdate)}`)
            continue
        }
        let profileImageUpdateEntity = new ProfileImageUpdate({
            id: profileImageUpdate.id,
            oldImageUri: profileEntity.imageUri,
            newImageUri: profileImageUpdate.imageUri,
            profile: profileEntity,
            txHash: profileImageUpdate.txHash,
            timestamp: profileImageUpdate.timestamp,
        })
        profileEntity.imageUri = profileImageUpdate.imageUri
        profileEntity.updatedAt = profileImageUpdate.timestamp
        NamedEntityBuffer.add('Save', profileImageUpdateEntity)
    }

    for (let profileTransfer of transferedProfiles) {
        let transferedProfileEntity = profiles.get(profileTransfer.profileId)
        if (transferedProfileEntity == null) {
            ctx.log.warn(`transfered profile is missing, tranfer: ${JSON.stringify(profileTransfer)}`)
            continue
        }
        let profileTransferEntity = new ProfileTransfer({
            id: profileTransfer.id,
            from: profileTransfer.from,
            to: profileTransfer.to,
            profile: transferedProfileEntity,
            txHash: profileTransfer.txHash,
            timestamp: profileTransfer.timestamp
        })
        transferedProfileEntity.address = profileTransfer.to
        transferedProfileEntity.updatedAt = profileTransfer.timestamp
        NamedEntityBuffer.add('Save', profileTransferEntity)
        addToAddresToProfileToMap(transferedProfileEntity)
    }

    // update publications

    const contentUris: {pubs: (Post | Comment)[], uris: string[]} = {pubs: [], uris: []}
    for (let pubData of createdPublications.sort(
        // sort by timestamp for correct entity insertion order
        (a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    ) {
        switch (pubData.variant) {
            case PublicationVariant.POST: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for post is missing, post: ${JSON.stringify(pubData)}`)
                    continue
                }
                contentUris.pubs.push(pubData.post)
                contentUris.uris.push(pubData.post.contentUri)
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.POST,
                    post: pubData.post,
                    txHash: pubData.txHash,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.post)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
            case PublicationVariant.MIRROR: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                let mirroredProfileEntity = profiles.get(pubData.mirroredProfileId)
                if (mirroredProfileEntity == null) {
                    ctx.log.warn(`mirrored profile for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                let mirroredPubEntity = pubs.get(pubData.mirroredPubId)
                if (mirroredPubEntity == null) {
                    ctx.log.warn(`mirrored publication for mirror is missing, mirror: ${JSON.stringify(pubData)}`)
                    continue
                }
                pubData.mirror.mirroredCreator = mirroredProfileEntity
                pubData.mirror.mirroredPublication = mirroredPubEntity
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.MIRROR,
                    mirror: pubData.mirror,
                    txHash: pubData.txHash,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.mirror)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
            case PublicationVariant.COMMENT: {
                let creatorEntity = profiles.get(pubData.creatorId)
                if (creatorEntity == null) {
                    ctx.log.warn(`creator profile for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                let commentedProfileEntity = profiles.get(pubData.commentedProfileId)
                if (commentedProfileEntity == null) {
                    ctx.log.warn(`commented profile for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                let commentedPubEntity = pubs.get(pubData.commentedPubId)
                if (commentedPubEntity == null) {
                    ctx.log.warn(`commented publication for comment is missing, comment: ${JSON.stringify(pubData)}`)
                    continue
                }
                contentUris.pubs.push(pubData.comment)
                contentUris.uris.push(pubData.comment.contentUri)
                pubData.comment.commentedCreator = commentedProfileEntity
                pubData.comment.commentedPublication = commentedPubEntity
                let pubEntity = new PublicationRef({
                    id: pubData.id,
                    creator: creatorEntity,
                    variant: PublicationVariant.COMMENT,
                    comment: pubData.comment,
                    txHash: pubData.txHash,
                    timestamp: pubData.timestamp
                })
                pubs.set(pubEntity.id, pubEntity)
                NamedEntityBuffer.add('Save', pubData.comment)
                NamedEntityBuffer.add('Save', pubEntity)
                break
            }
        }
    }

    for (let collectData of createdCollects) {
        let commentedProfileEntity = profiles.get(collectData.profileId)
        if (commentedProfileEntity == null) {
            ctx.log.warn(`collected profile for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let collectedPubEntity = pubs.get(collectData.pubId)
        if (collectedPubEntity == null) {
            ctx.log.warn(`collected publication for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let commentedRootProfileEntity = profiles.get(collectData.rootProfileId)
        if (commentedRootProfileEntity == null) {
            ctx.log.warn(`collected root profile for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }
        let collectedRootPubEntity = pubs.get(collectData.rootPubId)
        if (collectedRootPubEntity == null) {
            ctx.log.warn(`collected root publication for collect is missing, collect: ${JSON.stringify(collectData)}`)
            continue
        }

        let collectorEntity: Profile | undefined = undefined
        let entities = profileToAddressMap.get(collectData.nftOwnerAddress)
        if (entities != null)
            for (let [timestamp, profileEntity] of entities.sort((a, b) => (a[0] > b[0] ? 1 : -1))) {
                if (timestamp < collectData.timestamp) {
                    collectorEntity = profileEntity
                }
            }

        let collectEntity = new Collect({
            id: collectData.id,
            nftOwnerAddress: collectData.nftOwnerAddress,
            collector: collectorEntity,
            collectedCreator: commentedProfileEntity,
            collectedPublication: collectedPubEntity,
            collectedRootCreator: commentedRootProfileEntity,
            collectedRootPublication: collectedRootPubEntity,
            txHash: collectData.txHash,
            timestamp: collectData.timestamp
        })
        NamedEntityBuffer.add('Save', collectEntity)
    }

    if (process.env.DONT_FETCH_CONTENT !== undefined) return

    const contents = await fetchContentBatch(ctx, contentUris.uris)
    contentUris.pubs.forEach((pubEntity, index) => {
        if (contents[index] == null) return
        for (let field of ['name', 'description', 'content']) {
            let [text, removed] = removeBrokenSurrogate(contents[index][field] || '')
            if (removed) {
                contents[index][field] = text
            }
        }
        pubEntity.content = contents[index]
    })
}
