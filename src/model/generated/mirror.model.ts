import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Profile} from "./profile.model"
import {Publication} from "./publication.model"

@Entity_()
export class Mirror {
    constructor(props?: Partial<Mirror>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileId!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    pubId!: bigint

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    creator!: Profile

    @Index_()
    @ManyToOne_(() => Publication, {nullable: true})
    publication!: Publication

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileIdPointed!: bigint

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    pubIdPointed!: bigint

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    creatorPointed!: Profile

    @Index_()
    @ManyToOne_(() => Publication, {nullable: true})
    publicationPointed!: Publication

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
