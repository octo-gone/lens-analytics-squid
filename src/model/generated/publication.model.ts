import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Profile} from "./profile.model"
import {PublicationVariant} from "./_publicationVariant"

@Entity_()
export class Publication {
    constructor(props?: Partial<Publication>) {
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

    @Column_("varchar", {length: 7, nullable: false})
    variant!: PublicationVariant

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
