import {Mirror, Post, PublicationVariant, Comment} from "../model";
import {Entity} from "../entityBuffer";

export type ProfileImageUpdateData = {
    imageUri: string;
    updatedAt: Date;
} & Entity

export type PublicationData = (
    {post: Post, variant: PublicationVariant.POST} |
    {mirror: Mirror, variant: PublicationVariant.MIRROR, mirroredProfileId: string, mirroredPubId: string} |
    {comment: Comment, variant: PublicationVariant.COMMENT, commentedProfileId: string, commentedPubId: string}
) & {creatorId: string, timestamp: Date} & Entity

export type CollectData = {
    collector: string,
    profileId: string,
    pubId: string,
    rootProfileId: string,
    rootPubId: string,
    timestamp: Date
} & Entity