import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {PublicationRef} from "./publicationRef.model"
import {Profile} from "./profile.model"

@Entity_()
export class Comment {
    constructor(props?: Partial<Comment>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string


    @Column_("text", {nullable: false})
    contentUri!: string

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    commentedCreator!: Profile

    @Index_()
    @ManyToOne_(() => PublicationRef, {nullable: true})
    commentedPublication!: PublicationRef
}
