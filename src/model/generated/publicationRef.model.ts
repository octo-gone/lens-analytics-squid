import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToOne as OneToOne_, JoinColumn as JoinColumn_} from "typeorm"
import {Profile} from "./profile.model"
import {PublicationVariant} from "./_publicationVariant"
import {Post} from "./post.model"
import {Mirror} from "./mirror.model"
import {Comment} from "./comment.model"

@Entity_()
export class PublicationRef {
    constructor(props?: Partial<PublicationRef>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    creator!: Profile

    @Index_()
    @Column_("varchar", {length: 7, nullable: false})
    variant!: PublicationVariant

    @Index_({unique: true})
    @OneToOne_(() => Post, {nullable: true})
    @JoinColumn_()
    post!: Post | undefined | null

    @Index_({unique: true})
    @OneToOne_(() => Mirror, {nullable: true})
    @JoinColumn_()
    mirror!: Mirror | undefined | null

    @Index_({unique: true})
    @OneToOne_(() => Comment, {nullable: true})
    @JoinColumn_()
    comment!: Comment | undefined | null

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
