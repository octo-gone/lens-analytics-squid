import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {PublicationRef} from "./publicationRef.model"
import {Profile} from "./profile.model"

@Entity_()
export class Mirror {
    constructor(props?: Partial<Mirror>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string


    @Index_()
    @ManyToOne_(() => Profile, {nullable: true})
    mirroredCreator!: Profile

    @Index_()
    @ManyToOne_(() => PublicationRef, {nullable: true})
    mirroredPublication!: PublicationRef
}
