import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class LensEventProfileCreated {
    constructor(props?: Partial<LensEventProfileCreated>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("int4", {nullable: false})
    blockNumber!: number

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    blockTimestamp!: Date

    @Index_()
    @Column_("text", {nullable: false})
    transactionHash!: string

    @Index_()
    @Column_("text", {nullable: false})
    contract!: string

    @Index_()
    @Column_("text", {nullable: false})
    eventName!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileId!: bigint

    @Index_()
    @Column_("text", {nullable: false})
    creator!: string

    @Index_()
    @Column_("text", {nullable: false})
    to!: string

    @Column_("text", {nullable: false})
    handle!: string

    @Column_("text", {nullable: false})
    imageUri!: string

    @Column_("text", {nullable: false})
    followModule!: string

    @Column_("text", {nullable: false})
    followModuleReturnData!: string

    @Column_("text", {nullable: false})
    followNfturi!: string

    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    timestamp!: bigint
}
