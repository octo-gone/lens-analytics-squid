import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import * as marshal from "./marshal"
import {Profile} from "./profile.model"

@Entity_()
export class Follow {
    constructor(props?: Partial<Follow>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    followerAddress!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: true})
    followerProfileId!: bigint | undefined | null

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    follower!: Profile | undefined | null

    @Column_("text", {array: true, nullable: true})
    profileIds!: (string)[] | undefined | null

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
