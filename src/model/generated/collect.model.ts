import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, Index as Index_, ManyToOne as ManyToOne_} from "typeorm"
import {Profile} from "./profile.model"
import {PublicationRef} from "./publicationRef.model"

@Entity_()
export class Collect {
    constructor(props?: Partial<Collect>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @Column_("text", {nullable: false})
    collector!: string

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    collectedCreator!: Profile

    @Index_()
    @ManyToOne_(() => PublicationRef, {nullable: true})
    collectedPublication!: PublicationRef

    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    collectedRootCreator!: Profile

    @Index_()
    @ManyToOne_(() => PublicationRef, {nullable: true})
    collectedRootPublication!: PublicationRef

    @Index_()
    @Column_("timestamp with time zone", {nullable: false})
    timestamp!: Date
}
