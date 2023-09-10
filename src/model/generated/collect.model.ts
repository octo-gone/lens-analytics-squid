import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Profile} from "./profile.model"
import {Publication} from "./publication.model"

@Entity_()
export class Collect {
    constructor(props?: Partial<Collect>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    collectorAddress!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileId!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    pubId!: bigint

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    pubCreator!: Profile

    @Index_()
    @ManyToOne_(() => Publication, {nullable: true})
    publication!: Publication

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    rootProfileId!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    rootPubId!: bigint

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    rootCreator!: Profile

    @Index_()
    @ManyToOne_(() => Publication, {nullable: true})
    rootPublication!: Publication

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
