import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Publication} from "./publication.model"
import {Post} from "./post.model"
import {Mirror} from "./mirror.model"
import {Comment} from "./comment.model"

@Entity_()
export class Profile {
    constructor(props?: Partial<Profile>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
    profileId!: bigint

    @Index_()
    @Column_("text", {nullable: false})
    address!: string

    @Index_()
    @Column_("text", {nullable: false})
    handle!: string

    @Column_("text", {nullable: false})
    imageUri!: string

    @OneToMany_(() => Publication, e => e.creator)
    publications!: Publication[]

    @OneToMany_(() => Post, e => e.creator)
    posts!: Post[]

    @OneToMany_(() => Mirror, e => e.creator)
    mirrors!: Mirror[]

    @OneToMany_(() => Comment, e => e.creator)
    comments!: Comment[]

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    createdAt!: Date

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    updatedAt!: Date
}
