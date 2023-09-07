export type ProfilePatchData = {
    id: string;
    profileId: bigint;
    address?: string;
    handle?: string;
    imageUri?: string;
    createdAt?: Date;
    updatedAt: Date;
}
